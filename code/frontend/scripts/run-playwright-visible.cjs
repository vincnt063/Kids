const fs = require('fs')
const path = require('path')
const os = require('os')
const { spawn } = require('child_process')

const rootDir = path.resolve(__dirname, '..')

const resolveChromiumExecutablePath = () => {
  const homeDir = os.homedir()
  const candidates = [
    process.env.PW_CHROMIUM_PATH,
    path.join(homeDir, 'Downloads', 'chrome-win64', 'chrome.exe'),
    path.join(homeDir, 'Downloads', 'chrome.exe'),
    path.join(homeDir, 'AppData', 'Local', 'ms-playwright', 'chromium-1208', 'chrome-win64', 'chrome.exe'),
    path.join(homeDir, 'AppData', 'Local', 'ms-playwright', 'chromium-1208', 'chrome-win', 'chrome.exe'),
    path.join('C:', 'Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join('C:', 'Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join('C:', 'Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join('C:', 'Program Files (x86)', 'Microsoft', 'Edge', 'Application', 'msedge.exe')
  ].filter(Boolean)

  return candidates.find((candidate) => fs.existsSync(candidate))
}

const browserPath = resolveChromiumExecutablePath()
const playwrightArgs = process.argv.slice(2)

if (!browserPath) {
  console.error('未找到可用浏览器。')
  console.error('请执行以下任一方式后再重试：')
  console.error('1. 在 frontend 目录运行: npx playwright install chromium')
  console.error('2. 手动下载浏览器后设置环境变量，例如：')
  console.error('   set PW_CHROMIUM_PATH=D:\\browser\\chrome-win64\\chrome.exe')
  process.exit(1)
}

console.log(`使用浏览器: ${browserPath}`)
console.log('可视化模式已启用：浏览器会放大显示，并在每个步骤之间停留。')

const child = spawn(
  'cmd.exe',
  ['/c', 'npx', 'playwright', 'test', '--headed', '--workers=1', '--reporter=line', ...playwrightArgs],
  {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PW_CHROMIUM_PATH: browserPath,
      PW_SLOWMO: process.env.PW_SLOWMO || '700',
      PW_BACKEND_PORT: process.env.PW_BACKEND_PORT || '8080',
      PW_FRONTEND_PORT: process.env.PW_FRONTEND_PORT || '3001',
      MAIL_TEST_MODE: process.env.MAIL_TEST_MODE || 'true',
      MAIL_TEST_API_ENABLED: process.env.MAIL_TEST_API_ENABLED || 'true',
      E2E_VISUAL: '1',
      E2E_VISUAL_PAUSE_MS: process.env.E2E_VISUAL_PAUSE_MS || '900',
      E2E_VISUAL_END_PAUSE_MS: process.env.E2E_VISUAL_END_PAUSE_MS || '1500'
    }
  }
)

child.on('close', (code) => {
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})
