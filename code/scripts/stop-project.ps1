$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$logDir = Join-Path $repoRoot 'logs'
$taskkillExe = Join-Path $env:SystemRoot 'System32\taskkill.exe'
$netstatExe = Join-Path $env:SystemRoot 'System32\netstat.exe'

$services = @(
  [pscustomobject]@{
    Name = 'frontend'
    Port = 3000
    PidFile = Join-Path $logDir 'frontend.pid'
  },
  [pscustomobject]@{
    Name = 'backend'
    Port = 8080
    PidFile = Join-Path $logDir 'backend.pid'
  }
)

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

function Invoke-TaskKill {
  param(
    [Parameter(Mandatory = $true)]
    [int]$Id
  )

  & $taskkillExe /PID $Id /T /F *> $null
  return ($LASTEXITCODE -eq 0)
}

function Stop-ServiceFromPidFile {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Service
  )

  $recordedPid = Read-PidFile -Path $Service.PidFile
  if (-not $recordedPid) {
    return
  }

  if (Invoke-TaskKill -Id $recordedPid) {
    Write-Host ('Stopped {0} using PID file. PID {1}' -f $Service.Name, $recordedPid)
  } else {
    Write-Host ('PID file for {0} existed, but PID {1} was not running.' -f $Service.Name, $recordedPid)
  }

  Remove-Item -LiteralPath $Service.PidFile -Force -ErrorAction SilentlyContinue
}

function Stop-ServiceFromPort {
  param(
    [Parameter(Mandatory = $true)]
    [pscustomobject]$Service
  )

  $portPids = Get-PortPids -Port $Service.Port
  if ($portPids.Count -eq 0) {
    Write-Host ('{0} is already stopped.' -f $Service.Name)
    return
  }

  foreach ($portPid in $portPids) {
    if (Invoke-TaskKill -Id $portPid) {
      Write-Host ('Stopped {0} from port {1}. PID {2}' -f $Service.Name, $Service.Port, $portPid)
    }
  }
}

foreach ($service in $services) {
  Stop-ServiceFromPidFile -Service $service
  Stop-ServiceFromPort -Service $service
  Remove-Item -LiteralPath $Service.PidFile -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host 'Project shutdown complete.'
