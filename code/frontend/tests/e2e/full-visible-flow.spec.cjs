const { test, expect } = require('@playwright/test')

const visualPauseMs = Number(process.env.E2E_VISUAL_PAUSE_MS || 600)
const visualEndPauseMs = Number(process.env.E2E_VISUAL_END_PAUSE_MS || 1200)
const backendPort = Number(process.env.PW_BACKEND_PORT || 8081)
const backendBaseUrl = `http://127.0.0.1:${backendPort}/api`

const scenario = {
  child: null,
  parent: null
}

const pause = async (page, duration = visualPauseMs) => {
  await page.waitForTimeout(duration)
}

const finishPause = async (page) => {
  await page.waitForTimeout(visualEndPauseMs)
}

const expectToast = async (page, text) => {
  const toast = page.locator('.el-message').filter({ hasText: text }).last()
  await expect(toast).toBeVisible()
}

const confirmDialog = async (page, buttonName = '确定') => {
  const dialog = page.locator('.el-message-box').last()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: buttonName }).click()
}

const buildAccount = (prefix, role) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const username = `${prefix}${suffix}`.slice(0, 20)
  return {
    role,
    username,
    password: 'abc12345',
    email: `${username}@kids-programming-e2e.local`,
    workName: `${username}-作品`
  }
}

const fetchRegisterCode = async (request, email) => {
  const response = await request.get(`${backendBaseUrl}/user/test-support/register-code`, {
    params: { email }
  })
  const body = await response.json()
  if (!response.ok() || body.code !== 200 || !body.data?.code) {
    return null
  }
  return body.data.code
}

const registerAccount = async (page, request, account) => {
  await page.goto('/register')
  await expect(page.getByRole('heading', { name: '注册' })).toBeVisible()
  await pause(page)

  await page.getByPlaceholder('请输入用户名（4-20 位）').fill(account.username)
  await page.getByPlaceholder('请输入常用邮箱').fill(account.email)
  if (account.role === 'parent') {
    await page.locator('.el-select').click()
    await page.locator('.el-select-dropdown__item').filter({ hasText: '家长' }).click()
  }
  await pause(page)

  const sendCodeResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/user/register/email-code'),
    { timeout: 15000 }
  )
  await page.locator('.send-code-button').click({ force: true })
  const sendCodeResponse = await sendCodeResponsePromise
  const sendCodeBody = await sendCodeResponse.json().catch(() => null)
  expect(sendCodeResponse.ok(), JSON.stringify(sendCodeBody)).toBeTruthy()
  expect(sendCodeBody?.code, JSON.stringify(sendCodeBody)).toBe(200)
  await expect
    .poll(async () => fetchRegisterCode(request, account.email), {
      timeout: 20000,
      message: `验证码未生成: ${account.email}`
    })
    .not.toBeNull()
  const code = await fetchRegisterCode(request, account.email)
  expect(code).toBeTruthy()
  await pause(page)

  await page.getByPlaceholder('请输入邮箱验证码').fill(code)
  await page.getByPlaceholder('请输入密码（6-20 位）').fill(account.password)
  await page.getByPlaceholder('请确认密码').fill(account.password)
  await pause(page)

  await page.getByRole('button', { name: '创建账号' }).click()
  await expectToast(page, '注册成功，请登录')
  await expect(page).toHaveURL(/\/login$/)
  await finishPause(page)
}

const loginFromPage = async (page, username, password) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: '登录', exact: true })).toBeVisible()
  await page.getByPlaceholder('请输入用户名').fill(username)
  await page.getByPlaceholder('请输入密码').fill(password)
  await pause(page)
  await page.getByRole('button', { name: '登录' }).click()
}

const logoutFromAuthenticatedPage = async (page) => {
  await page.getByRole('button', { name: '退出登录' }).click()
  await confirmDialog(page)
  await expectToast(page, '已退出登录')
  await expect(page).toHaveURL(/\/login$/)
}

test.describe.serial('Visible full browser coverage', () => {
  test('游客浏览并注册学生和家长账号', async ({ page, request }) => {
    scenario.child = buildAccount('e2ec', 'child')
    scenario.parent = buildAccount('e2ep', 'parent')

    await page.goto('/')
    await expect(page.getByRole('heading', { name: /拖一拖积木/ })).toBeVisible()
    await pause(page)

    await page.getByRole('button', { name: '学习地图' }).click()
    await expect(page).toHaveURL(/\/path$/)
    await expect(page.getByRole('heading', { name: '学习地图' })).toBeVisible()
    await pause(page)

    await page.getByRole('button', { name: '去闯关' }).click()
    await expect(page).toHaveURL(/\/levels$/)
    await expect(page.getByRole('heading', { name: '选一个小任务，开始闯关' })).toBeVisible()
    await pause(page)

    await registerAccount(page, request, scenario.child)
    await registerAccount(page, request, scenario.parent)
  })

  test('学生账号登录、闯关实验室和学习进度', async ({ page }) => {
    await loginFromPage(page, scenario.child.username, scenario.child.password)
    await expectToast(page, '登录成功')
    await expect(page).toHaveURL(/\/levels$/)
    await expect(page.getByRole('heading', { name: '选一个小任务，开始闯关' })).toBeVisible()
    await pause(page)

    await page.getByRole('button', { name: '从第一关开始' }).click()
    await expect(page).toHaveURL(/\/lab\?caseId=1/)
    await expect(page.getByRole('button', { name: '开始运行' })).toBeVisible()
    await pause(page)

    await page.getByRole('button', { name: '开始运行' }).click()
    await page.waitForTimeout(2500)
    await page.getByRole('button', { name: '收藏作品' }).click()
    await expect(page.getByRole('dialog', { name: '收藏作品' })).toBeVisible()
    await page.getByPlaceholder('例如：小猫回家第一次成功').fill(scenario.child.workName)
    await pause(page)
    await page.getByRole('button', { name: '保存到账号' }).click()
    await expectToast(page, '已经保存到当前账号')
    await pause(page)

    await page.getByRole('button', { name: '学习进度' }).click()
    await expect(page).toHaveURL(/\/progress$/)
    await expect(page.getByRole('heading', { name: new RegExp(`${scenario.child.username} 的学习记录`) })).toBeVisible()
    await expect(page.getByText(scenario.child.workName, { exact: true })).toBeVisible()
    await pause(page)
  })

  test('管理员后台浏览和核心操作入口', async ({ page }) => {
    await loginFromPage(page, 'admin_demo', 'admin123')
    await expectToast(page, '登录成功')
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: '控制台' })).toBeVisible()
    await pause(page)

    await page.getByRole('button', { name: '用户管理' }).click()
    await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
    const userRow = page.locator('.el-table__row').filter({ hasText: scenario.child.username }).first()
    await expect(userRow).toBeVisible()
    await userRow.getByRole('button', { name: '编辑' }).click()
    await expect(page.getByRole('dialog', { name: '编辑用户状态' })).toBeVisible()
    await pause(page)
    await page.getByRole('dialog', { name: '编辑用户状态' }).getByRole('button', { name: '保存' }).click()
    await expectToast(page, `已恢复正常用户 ${scenario.child.username}`)
    await pause(page)

    await page.getByRole('button', { name: '模块管理' }).click()
    await expect(page.getByRole('heading', { name: '模块管理' })).toBeVisible()
    const moduleRow = page.locator('.el-table__row').filter({ hasText: '当绿旗被点击' }).first()
    await moduleRow.getByRole('button', { name: '编辑' }).click()
    const moduleDialog = page.getByRole('dialog', { name: '编辑模块' })
    await expect(moduleDialog).toBeVisible()
    await moduleDialog.getByPlaceholder('例如：#4A7FC8').fill('#FFBF00')
    await pause(page)
    await moduleDialog.getByRole('button', { name: '保存' }).click()
    await expectToast(page, '已更新模块 当绿旗被点击')
    await pause(page)

    await page.getByRole('button', { name: '案例管理' }).click()
    await expect(page.getByRole('heading', { name: '案例管理' })).toBeVisible()
    const caseRow = page.locator('.el-table__row').filter({ hasText: '关卡 1：小猫回家' }).first()
    await caseRow.getByRole('button', { name: '编辑' }).click()
    const caseDialog = page.getByRole('dialog', { name: '编辑案例' })
    await expect(caseDialog).toBeVisible()
    await pause(page)
    await caseDialog.getByRole('button', { name: '保存' }).click()
    await expectToast(page, '已更新案例 关卡 1：小猫回家')
    await pause(page)

    await caseRow.getByRole('button', { name: '预览' }).click()
    await expect(page).toHaveURL(/\/lab\?caseId=1&adminPreview=1/)
    await expect(page.getByRole('button', { name: '返回关卡' })).toBeVisible()
    await pause(page)

    await page.goto('/admin')
    await page.getByRole('button', { name: '学习记录' }).click()
    await expect(page.getByRole('heading', { name: '学习记录' })).toBeVisible()
    const recordRow = page.locator('.el-table__row').filter({ hasText: '关卡1通关作品' }).first()
    await recordRow.getByRole('button', { name: '查看' }).click()
    await expectToast(page, '查看作品：关卡1通关作品')
    await pause(page)

    await page.locator('.user-entry').click()
    await page.getByRole('menuitem', { name: '退出登录' }).click()
    await confirmDialog(page)
    await expectToast(page, '已退出登录')
    await expect(page).toHaveURL(/\/login$/)
    await finishPause(page)
  })

  test('家长绑定学生并冻结再恢复账号', async ({ page }) => {
    console.log('[parent] start login')
    await loginFromPage(page, scenario.parent.username, scenario.parent.password)
    console.log('[parent] login submitted')
    await expectToast(page, '登录成功')
    console.log('[parent] toast visible')
    await expect(page).toHaveURL(/\/parent-progress$/)
    console.log('[parent] url ready')
    await expect(page.getByRole('heading', { name: new RegExp(`${scenario.parent.username} 的学生管理`) })).toBeVisible()
    console.log('[parent] heading visible')
    await pause(page)

    console.log('[parent] fill bind form')
    await page.getByPlaceholder('请输入学生账号').fill(scenario.child.username)
    await page.getByPlaceholder('请输入学生密码').fill(scenario.child.password)
    await pause(page)
    console.log('[parent] submit bind form')
    await page.getByRole('button', { name: '绑定学生账号' }).click()
    const studentCard = page.locator('.student-card').filter({ hasText: scenario.child.username }).first()
    await expect(studentCard).toBeVisible()
    console.log('[parent] student card visible')
    await expectToast(page, '绑定成功')
    console.log('[parent] bind toast visible')
    await pause(page)
    console.log('[parent] click freeze')
    await studentCard.getByRole('button', { name: '冻结账号' }).click()
    console.log('[parent] confirm freeze dialog')
    await confirmDialog(page)
    console.log('[parent] dialog confirmed')
    await expectToast(page, '已冻结学生账号')
    console.log('[parent] freeze toast visible')
    await expect(studentCard.getByRole('button', { name: '启用账号' })).toBeVisible()
    console.log('[parent] enabled button visible')
    await finishPause(page)
    console.log('[parent] end')
  })
})
