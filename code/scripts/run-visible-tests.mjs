import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

const rootDir = path.resolve(import.meta.dirname, '..')
const frontendDir = path.join(rootDir, 'frontend')
const backendDir = path.join(rootDir, 'backend')
const logsDir = path.join(rootDir, 'logs')

fs.mkdirSync(logsDir, { recursive: true })

const formatTime = (date = new Date()) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`

const logPath = path.join(logsDir, `test-run-${formatTime()}.log`)
const logStream = fs.createWriteStream(logPath, { flags: 'a' })

const writeLog = (line = '') => {
  process.stdout.write(`${line}\n`)
  logStream.write(`${line}\n`)
}

const divider = (title = '') => {
  const line = '='.repeat(72)
  writeLog(line)
  if (title) {
    writeLog(title)
    writeLog(line)
  }
}

const formatDuration = (ms) => `${(ms / 1000).toFixed(ms >= 10000 ? 1 : 2)}s`

const pipeLines = (stream, prefix) => {
  let buffer = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    buffer += chunk.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    lines.forEach((line) => writeLog(`${prefix}${line}`))
  })
  stream.on('end', () => {
    if (buffer) {
      writeLog(`${prefix}${buffer}`)
      buffer = ''
    }
  })
}

const runCommand = ({ name, cwd, command, args }) =>
  new Promise((resolve) => {
    const startedAt = Date.now()
    writeLog(`[STEP] ${name}`)
    writeLog(`[CMD ] ${command} ${args.join(' ')}`)
    writeLog(`[CWD ] ${cwd}`)

    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    pipeLines(child.stdout, `[OUT ][${name}] `)
    pipeLines(child.stderr, `[ERR ][${name}] `)

    child.on('error', (error) => {
      writeLog(`[FAIL] ${name} could not start: ${error.message}`)
      resolve({
        name,
        ok: false,
        code: null,
        durationMs: Date.now() - startedAt
      })
    })

    child.on('close', (code) => {
      const ok = code === 0
      writeLog(`[${ok ? 'PASS' : 'FAIL'}] ${name} (${formatDuration(Date.now() - startedAt)})`)
      resolve({
        name,
        ok,
        code,
        durationMs: Date.now() - startedAt
      })
    })
  })

const requestJson = async (url) => {
  const response = await fetch(url)
  const text = await response.text()

  try {
    return { ok: response.ok, status: response.status, data: JSON.parse(text) }
  } catch (error) {
    return { ok: response.ok, status: response.status, data: text }
  }
}

const isBackendHealthy = async () => {
  try {
    const result = await requestJson('http://127.0.0.1:8080/api/character/list')
    return result.ok && result.data?.code === 200
  } catch (error) {
    return false
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForBackend = async (timeoutMs = 90000) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await isBackendHealthy()) {
      return true
    }
    await wait(2000)
  }
  return false
}

const stopProcessTree = (pid) => {
  if (!pid || process.platform !== 'win32') {
    return
  }

  spawnSync('cmd.exe', ['/c', 'taskkill', '/PID', String(pid), '/T', '/F'], {
    stdio: 'ignore'
  })
}

const ensureBackend = async () => {
  if (await isBackendHealthy()) {
    writeLog('[INFO] Backend is already running on http://127.0.0.1:8080 .')
    return { ok: true, owned: false, process: null }
  }

  writeLog('[INFO] Backend is not ready. Starting a temporary backend for API tests...')
  writeLog('[CMD ] mvn -q -DskipTests spring-boot:run -Dspring-boot.run.arguments=--spring.sql.init.mode=never')

  const backendProcess = spawn(
    'cmd.exe',
    ['/c', 'mvn', '-q', '-DskipTests', 'spring-boot:run', '-Dspring-boot.run.arguments=--spring.sql.init.mode=never'],
    {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  pipeLines(backendProcess.stdout, '[OUT ][backend] ')
  pipeLines(backendProcess.stderr, '[ERR ][backend] ')

  backendProcess.on('error', (error) => {
    writeLog(`[FAIL] Temporary backend failed to start: ${error.message}`)
  })

  const ready = await waitForBackend()
  if (!ready) {
    writeLog('[FAIL] Backend did not become ready within 90s.')
    stopProcessTree(backendProcess.pid)
    return { ok: false, owned: false, process: null }
  }

  writeLog('[PASS] Temporary backend is ready.')
  return { ok: true, owned: true, process: backendProcess }
}

const main = async () => {
  const startedAt = Date.now()
  const results = []
  let backendHandle = null

  divider('VISIBLE TEST RUN')
  writeLog(`[INFO] Workspace : ${rootDir}`)
  writeLog(`[INFO] Log file  : ${logPath}`)
  writeLog(`[INFO] Started   : ${new Date().toLocaleString()}`)
  writeLog('')

  const stepQueue = [
    {
      name: 'Frontend Smoke',
      cwd: frontendDir,
      command: 'cmd.exe',
      args: ['/c', 'npm', 'run', 'smoke']
    },
    {
      name: 'Level Solution Smoke',
      cwd: rootDir,
      command: 'cmd.exe',
      args: ['/c', 'node', 'scripts\\level-solution-smoke.mjs']
    },
    {
      name: 'Frontend Build',
      cwd: frontendDir,
      command: 'cmd.exe',
      args: ['/c', 'npm', 'run', 'build']
    },
    {
      name: 'Backend Compile',
      cwd: backendDir,
      command: 'cmd.exe',
      args: ['/c', 'mvn', '-q', '-DskipTests', 'compile']
    }
  ]

  for (const step of stepQueue) {
    writeLog('')
    results.push(await runCommand(step))
  }

  writeLog('')
  divider('API TEST PREP')
  backendHandle = await ensureBackend()

  if (backendHandle.ok) {
    writeLog('')
    results.push(await runCommand({
      name: 'Runtime API Smoke',
      cwd: rootDir,
      command: 'cmd.exe',
      args: ['/c', 'node', 'scripts\\runtime-api-smoke.mjs']
    }))
  } else {
    results.push({
      name: 'Runtime API Smoke',
      ok: false,
      code: null,
      durationMs: 0,
      skipped: true
    })
    writeLog('[FAIL] Runtime API Smoke was skipped because backend setup failed.')
  }

  if (backendHandle?.owned && backendHandle.process?.pid) {
    writeLog('')
    writeLog('[INFO] Stopping temporary backend...')
    stopProcessTree(backendHandle.process.pid)
  }

  writeLog('')
  divider('SUMMARY')

  results.forEach((item, index) => {
    const status = item.ok ? 'PASS' : item.skipped ? 'SKIP' : 'FAIL'
    writeLog(
      `${String(index + 1).padStart(2, '0')}. ${status.padEnd(4)} ${item.name} ${item.durationMs ? `(${formatDuration(item.durationMs)})` : ''}`.trim()
    )
  })

  const passed = results.filter((item) => item.ok).length
  const failed = results.filter((item) => !item.ok).length
  writeLog('')
  writeLog(`[INFO] Passed steps : ${passed}`)
  writeLog(`[INFO] Failed steps : ${failed}`)
  writeLog(`[INFO] Total time   : ${formatDuration(Date.now() - startedAt)}`)
  writeLog(`[INFO] Full log     : ${logPath}`)

  logStream.end()

  if (failed > 0) {
    process.exitCode = 1
    return
  }

  process.exitCode = 0
}

main().catch((error) => {
  writeLog('')
  writeLog(`[FATAL] ${error.stack || error.message}`)
  logStream.end()
  process.exitCode = 1
})
