const path = require('path')
const { defineConfig, devices } = require('@playwright/test')
const fs = require('fs')
const os = require('os')

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

const chromiumExecutablePath = resolveChromiumExecutablePath()
const visualMode = process.env.E2E_VISUAL === '1'
const frontendPort = Number(process.env.PW_FRONTEND_PORT || 3001)
const backendPort = Number(process.env.PW_BACKEND_PORT || 8080)
const frontendUrl = `http://127.0.0.1:${frontendPort}`
const backendUrl = `http://127.0.0.1:${backendPort}`

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 240_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: visualMode ? null : { width: 1440, height: 960 },
    launchOptions: {
      slowMo: Number(process.env.PW_SLOWMO || 0),
      args: visualMode ? ['--start-maximized'] : [],
      ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {})
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  webServer: [
    {
      command: `cmd.exe /c npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      cwd: __dirname,
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: `cmd.exe /c start-e2e-backend.cmd ${backendPort}`,
      cwd: path.resolve(__dirname, '../backend'),
      url: `${backendUrl}/api/character/list`,
      reuseExistingServer: false,
      timeout: 180_000
    }
  ]
})
