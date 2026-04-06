$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$logDir = Join-Path $repoRoot 'logs'
$cmdExe = Join-Path $env:SystemRoot 'System32\cmd.exe'
$netstatExe = Join-Path $env:SystemRoot 'System32\netstat.exe'
$localMailConfigPath = Join-Path $repoRoot 'backend\mail.local.ps1'

$services = @(
  [pscustomobject]@{
    Name = 'backend'
    WorkDir = Join-Path $repoRoot 'backend'
    Command = 'mvn spring-boot:run'
    Port = 8080
    StartupTimeoutSeconds = 90
    PidFile = Join-Path $logDir 'backend.pid'
    OutLog = Join-Path $logDir 'backend.out.log'
    ErrLog = Join-Path $logDir 'backend.err.log'
    Pid = $null
    AlreadyRunning = $false
  },
  [pscustomobject]@{
    Name = 'frontend'
    WorkDir = Join-Path $repoRoot 'frontend'
    Command = 'npm run dev'
    Port = 3000
    StartupTimeoutSeconds = 30
    PidFile = Join-Path $logDir 'frontend.pid'
    OutLog = Join-Path $logDir 'frontend.out.log'
    ErrLog = Join-Path $logDir 'frontend.err.log'
    Pid = $null
    AlreadyRunning = $false
  }
)

function Assert-Command {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw ('Missing required command: {0}. Make sure it is installed and on PATH.' -f $Name)
  }
}

function Read-PidFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  $raw = (Get-Content -LiteralPath $Path -Raw).Trim()
  if ($raw -match '^\d+$') {
    return [int]$raw
  }

  return $null
}

function Test-ProcessRunning {
  param(
    [Parameter(Mandatory = $true)]
    [int]$Id
  )

  try {
    Get-Process -Id $Id -ErrorAction Stop | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Get-PortPids {
  param(
    [Parameter(Mandatory = $true)]
    [int]$Port
  )

  $pattern = '^\s*TCP\s+\S+:{0}\s+\S+\s+\S+\s+(\d+)\s*$' -f $Port
  $result = @()

  foreach ($line in (& $netstatExe -ano 2>$null)) {
    if ($line -match $pattern) {
      $matchedPid = [int]$Matches[1]
      if ($matchedPid -gt 0) {
        $result += $matchedPid
      }
    }
  }

  return @($result | Sort-Object -Unique)
}

function Initialize-ServiceState {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Service
  )

  $existingPid = Read-PidFile -Path $Service.PidFile
  if ($existingPid) {
    if (Test-ProcessRunning -Id $existingPid) {
      $Service.Pid = $existingPid
      $Service.AlreadyRunning = $true
      Write-Host ('{0} is already running. PID {1}' -f $Service.Name, $existingPid)
      return
    }

    Remove-Item -LiteralPath $Service.PidFile -Force -ErrorAction SilentlyContinue
  }

  $portPids = Get-PortPids -Port $Service.Port
  if ($portPids.Count -gt 0) {
    throw (
      'Port {0} is already in use by PID(s): {1}. Stop the conflicting process or run stop-project.bat first.' -f
      $Service.Port,
      (($portPids | ForEach-Object { $_.ToString() }) -join ', ')
    )
  }
}

function Wait-ForServicePort {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Service
  )

  $deadline = (Get-Date).AddSeconds($Service.StartupTimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if ((Get-PortPids -Port $Service.Port).Count -gt 0) {
      return
    }

    if (-not (Test-ProcessRunning -Id $Service.Pid)) {
      throw (
        '{0} exited during startup. Check {1} and {2}.' -f
        $Service.Name,
        $Service.OutLog,
        $Service.ErrLog
      )
    }

    Start-Sleep -Milliseconds 500
  }

  throw (
    '{0} did not bind port {1} within {2} seconds. Check {3} and {4}.' -f
    $Service.Name,
    $Service.Port,
    $Service.StartupTimeoutSeconds,
    $Service.OutLog,
    $Service.ErrLog
  )
}

function Start-ServiceProcess {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Service
  )

  if (-not (Test-Path -LiteralPath $Service.WorkDir)) {
    throw ('Missing service directory: {0}' -f $Service.WorkDir)
  }

  $process = Start-Process `
    -FilePath $cmdExe `
    -WorkingDirectory $Service.WorkDir `
    -ArgumentList '/c', $Service.Command `
    -WindowStyle Hidden `
    -RedirectStandardOutput $Service.OutLog `
    -RedirectStandardError $Service.ErrLog `
    -PassThru

  Start-Sleep -Seconds 2

  if ($process.HasExited) {
    throw (
      '{0} exited immediately. Check {1} and {2}.' -f
      $Service.Name,
      $Service.OutLog,
      $Service.ErrLog
    )
  }

  $Service.Pid = $process.Id
  Set-Content -LiteralPath $Service.PidFile -Value $Service.Pid -Encoding ascii
  Wait-ForServicePort -Service $Service

  Write-Host (
    'Started {0}. PID {1}, port {2}' -f
    $Service.Name,
    $Service.Pid,
    $Service.Port
  )
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

if (Test-Path -LiteralPath $localMailConfigPath) {
  & $localMailConfigPath
  Write-Host ('Loaded local mail configuration from {0}' -f $localMailConfigPath)
}

Assert-Command -Name 'java'
Assert-Command -Name 'mvn'
Assert-Command -Name 'npm'

foreach ($service in $services) {
  Initialize-ServiceState -Service $service
}

foreach ($service in $services) {
  if ($service.AlreadyRunning) {
    continue
  }

  Start-ServiceProcess -Service $service
}

Write-Host ''
Write-Host 'Project startup complete.'
Write-Host ('Backend log:  {0}' -f (Join-Path $logDir 'backend.out.log'))
Write-Host ('Frontend log: {0}' -f (Join-Path $logDir 'frontend.out.log'))
