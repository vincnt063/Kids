import path from 'node:path'
import { spawn } from 'node:child_process'

const rootDir = path.resolve(import.meta.dirname, '..')
const child = spawn(process.execPath, ['scripts/serve-frontend-preview.mjs'], {
  cwd: rootDir,
  detached: true,
  stdio: 'ignore'
})

child.unref()
console.log(`[INFO] Preview server started in background. PID=${child.pid}`)
