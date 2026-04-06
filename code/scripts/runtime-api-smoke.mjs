const baseUrl = process.argv[2] || 'http://127.0.0.1:8080/api'

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()

  let data = null
  try {
    data = JSON.parse(text)
  } catch (error) {
    data = text
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  }
}

const postJson = (path, body) =>
  requestJson(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

const loginWithCandidates = async (candidates) => {
  const attempts = []

  for (const candidate of candidates) {
    const result = await postJson('/user/login', candidate)
    attempts.push({
      username: candidate.username,
      status: result.status,
      code: result.data?.code,
      message: result.data?.message,
      role: result.data?.data?.user?.role
    })

    if (result.status === 200 && result.data?.code === 200) {
      return {
        ok: true,
        candidate,
        result,
        attempts
      }
    }
  }

  return {
    ok: false,
    attempts
  }
}

const state = {
  adminUserId: null,
  parentUserId: null,
  allPassUserId: null,
  caseCount: null,
  moduleCount: null,
  recordCount: null
}

const checks = [
  {
    name: 'case-list',
    run: () => requestJson('/case/list'),
    pass: (result) => {
      const cases = result.data?.data
      const ok = result.status === 200 && result.data?.code === 200 && Array.isArray(cases) && cases.length >= 1
      if (ok) {
        state.caseCount = cases.length
      }
      return ok
    }
  },
  {
    name: 'login-admin',
    run: () =>
      loginWithCandidates([
        { username: 'admin_demo', password: 'admin123' },
        { username: 'admin', password: 'admin123' }
      ]),
    pass: (result) => {
      const ok = result.ok === true && result.result?.data?.data?.user?.role === 'admin'
      if (ok) {
        state.adminUserId = result.result.data.data.user.id
      }
      return ok
    }
  },
  {
    name: 'login-parent-demo',
    run: () => postJson('/user/login', { username: 'parent_demo', password: 'parent123' }),
    pass: (result) => {
      const ok = result.status === 200 && result.data?.code === 200 && result.data?.data?.user?.role === 'parent'
      if (ok) {
        state.parentUserId = result.data.data.user.id
      }
      return ok
    }
  },
  {
    name: 'login-all-pass-demo',
    run: () => postJson('/user/login', { username: 'all_pass_demo', password: '123456' }),
    pass: (result) => {
      const ok = result.status === 200 && result.data?.code === 200 && result.data?.data?.user?.username === 'all_pass_demo'
      if (ok) {
        state.allPassUserId = result.data.data.user.id
      }
      return ok
    }
  },
  {
    name: 'user-info',
    run: () => requestJson(`/user/info?userId=${state.allPassUserId}`),
    pass: (result) => result.status === 200 && result.data?.code === 200 && result.data?.data?.username === 'all_pass_demo'
  },
  {
    name: 'progress-summary',
    run: () => requestJson(`/progress/user/${state.allPassUserId}`),
    pass: (result) => {
      const progress = result.data?.data
      return (
        result.status === 200 &&
        result.data?.code === 200 &&
        progress?.userId === state.allPassUserId &&
        progress?.totalCases === state.caseCount &&
        progress?.currentLevel >= 1 &&
        progress?.totalPoints === progress.totalCases * 30
      )
    }
  },
  {
    name: 'progress-cases',
    run: () => requestJson(`/progress/user/${state.allPassUserId}/cases`),
    pass: (result) => {
      const items = result.data?.data
      return (
        result.status === 200 &&
        result.data?.code === 200 &&
        Array.isArray(items) &&
        items.length === state.caseCount &&
        items.every((item) => item.completed === true && Number(item.stars) >= 1)
      )
    }
  },
  {
    name: 'progress-update-idempotent',
    run: () => postJson('/progress/update', { userId: state.allPassUserId, caseId: 1, stars: 3 }),
    pass: (result) => result.status === 200 && result.data?.code === 200 && result.data?.data?.success === true
  },
  {
    name: 'character-list',
    run: () => requestJson('/character/list'),
    pass: (result) => result.status === 200 && result.data?.code === 200 && Array.isArray(result.data?.data) && result.data.data.length >= 5
  },
  {
    name: 'character-unlock',
    run: () => requestJson('/character/unlock/5'),
    pass: (result) => result.status === 200 && result.data?.code === 200 && Array.isArray(result.data?.data) && result.data.data.length >= 5
  },
  {
    name: 'stats-overview',
    run: () => requestJson('/stats/overview'),
    pass: (result) => {
      const stats = result.data?.data
      const ok =
        result.status === 200 &&
        result.data?.code === 200 &&
        (stats?.userCount || 0) >= 3 &&
        stats?.activeCaseCount === state.caseCount &&
        (stats?.moduleCount || 0) >= 17 &&
        (stats?.recordCount || 0) >= state.caseCount

      if (ok) {
        state.moduleCount = stats.moduleCount
        state.recordCount = stats.recordCount
      }

      return ok
    }
  },
  {
    name: 'stats-dashboard',
    run: () => requestJson('/stats/dashboard'),
    pass: (result) => {
      const dashboard = result.data?.data
      return (
        result.status === 200 &&
        result.data?.code === 200 &&
        Array.isArray(dashboard?.users) &&
        dashboard.users.some((item) => item.role === 'admin') &&
        dashboard.users.some((item) => item.username === 'all_pass_demo') &&
        Array.isArray(dashboard?.cases) &&
        dashboard.cases.length === state.caseCount &&
        Array.isArray(dashboard?.modules) &&
        dashboard.modules.length === state.moduleCount &&
        Array.isArray(dashboard?.records) &&
        dashboard.records.length === state.recordCount &&
        dashboard.stats?.activeCaseCount === state.caseCount
      )
    }
  }
]

let hasFailure = false

for (const item of checks) {
  const result = await item.run()
  if (!item.pass(result)) {
    hasFailure = true
    console.error('API_SMOKE_FAIL', item.name, JSON.stringify(result))
  } else {
    console.log('API_SMOKE_OK', item.name)
  }
}

if (hasFailure) {
  process.exit(1)
}
