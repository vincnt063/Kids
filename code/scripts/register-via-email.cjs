const [,, action, ...args] = process.argv

const baseUrl = process.env.APP_API_BASE_URL || 'http://127.0.0.1:8080/api'

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const readJson = async (response) => {
  const text = await response.text()
  try {
    return {
      status: response.status,
      ok: response.ok,
      body: JSON.parse(text)
    }
  } catch (error) {
    return {
      status: response.status,
      ok: response.ok,
      body: text
    }
  }
}

const postJson = async (path, payload) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  return readJson(response)
}

const sendCode = async (email) => {
  if (!email) {
    fail('Usage: node scripts/register-via-email.cjs send <email>')
  }

  const result = await postJson('/user/register/email-code', { email })
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.ok ? 0 : 1)
}

const register = async (username, email, password, role, emailCode) => {
  if (!username || !email || !password || !role || !emailCode) {
    fail('Usage: node scripts/register-via-email.cjs register <username> <email> <password> <role> <emailCode>')
  }

  const result = await postJson('/user/register', {
    username,
    email,
    password,
    confirmPassword: password,
    role,
    emailCode
  })
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.ok ? 0 : 1)
}

const main = async () => {
  if (action === 'send') {
    await sendCode(args[0])
    return
  }

  if (action === 'register') {
    await register(args[0], args[1], args[2], args[3], args[4])
    return
  }

  fail(
    [
      'Usage:',
      '  node scripts/register-via-email.cjs send <email>',
      '  node scripts/register-via-email.cjs register <username> <email> <password> <role> <emailCode>'
    ].join('\n')
  )
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error))
  process.exit(1)
})
