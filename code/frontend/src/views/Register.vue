<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="auth-copy">
        <router-link to="/" class="back-home">返回首页</router-link>
        <span class="auth-kicker">Create Account</span>
        <h1>创建一个绑定邮箱的新账号</h1>
        <p>注册时需要先完成邮箱验证。学生账号可直接闯关，家长账号可绑定学生查看学习进度。</p>

        <div class="auth-points">
          <span>邮箱验证码注册</span>
          <span>学生学习入口</span>
          <span>家长绑定与管控</span>
        </div>
      </section>

      <section class="auth-card">
        <div class="card-header">
          <h2>注册</h2>
          <p>先完成邮箱验证，再创建账号进入系统。</p>
        </div>

        <el-form ref="registerFormRef" :model="form" :rules="rules" class="auth-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              :prefix-icon="User"
              placeholder="请输入用户名（4-20 位）"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              :prefix-icon="Message"
              placeholder="请输入常用邮箱"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="emailCode">
            <el-input
              v-model="form.emailCode"
              :prefix-icon="Message"
              placeholder="请输入邮箱验证码"
              size="large"
              @keyup.enter="handleRegister"
            >
              <template #append>
                <el-button
                  class="send-code-button"
                  :loading="codeLoading"
                  :disabled="codeLoading || codeCooldown > 0"
                  @click="handleSendCode"
                >
                  {{ codeCooldown > 0 ? `${codeCooldown}s 后重发` : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码（6-20 位）"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              :prefix-icon="Lock"
              type="password"
              placeholder="请确认密码"
              size="large"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <el-form-item prop="role">
            <el-select v-model="form.role" placeholder="选择用户类型" size="large" class="full-width">
              <el-option label="学生" value="child" />
              <el-option label="家长" value="parent" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              size="large"
              class="submit-button"
              @click="handleRegister"
            >
              创建账号
            </el-button>
          </el-form-item>
        </el-form>

        <div class="links">
          <span>已经有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, User } from '@element-plus/icons-vue'
import { register, sendRegisterEmailCode } from '@/api/user'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const codeLoading = ref(false)
const codeCooldown = ref(0)
let codeTimer = null

const form = reactive({
  username: '',
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: '',
  role: 'child'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }

  callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度在 4-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为 6 位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

const clearCodeTimer = () => {
  if (codeTimer) {
    clearInterval(codeTimer)
    codeTimer = null
  }
}

const startCodeCooldown = () => {
  codeCooldown.value = 60
  clearCodeTimer()

  codeTimer = window.setInterval(() => {
    if (codeCooldown.value <= 1) {
      clearCodeTimer()
      codeCooldown.value = 0
      return
    }

    codeCooldown.value -= 1
  }, 1000)
}

const handleSendCode = async () => {
  if (!registerFormRef.value || codeLoading.value || codeCooldown.value > 0) {
    return
  }

  try {
    await registerFormRef.value.validateField('email')
  } catch (error) {
    return
  }

  codeLoading.value = true

  try {
    await sendRegisterEmailCode({ email: form.email })
    ElMessage.success('验证码已发送，请查收邮箱')
    startCodeCooldown()
  } catch (error) {
    if (!error.handled) {
      ElMessage.error(error.message || '验证码发送失败，请稍后重试')
    }
  } finally {
    codeLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) {
    return
  }

  try {
    await registerFormRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  try {
    await register({
      username: form.username,
      email: form.email,
      emailCode: form.emailCode,
      password: form.password,
      role: form.role
    })

    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    if (!error.handled) {
      ElMessage.error(error.message || '注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  clearCodeTimer()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 32px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(106, 167, 255, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(255, 205, 118, 0.22), transparent 30%),
    var(--app-bg);
}

.auth-shell {
  width: min(1020px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;
}

.auth-copy,
.auth-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--app-line);
  border-radius: 28px;
  box-shadow: var(--app-shadow);
}

.auth-copy {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.back-home {
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f5f7fb;
  color: var(--app-text);
  font-size: 13px;
}

.auth-kicker {
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--app-warm);
  color: #99601a;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.auth-copy h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.14;
}

.auth-copy p {
  margin: 0;
  max-width: 470px;
  color: var(--app-text-soft);
  font-size: 16px;
  line-height: 1.8;
}

.auth-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.auth-points span {
  padding: 9px 14px;
  border-radius: 999px;
  background: #f5f7fb;
  color: #55657f;
  font-size: 13px;
}

.auth-card {
  padding: 32px;
}

.card-header {
  margin-bottom: 24px;
}

.card-header h2 {
  margin: 0;
  font-size: 28px;
}

.card-header p {
  margin: 8px 0 0;
  color: var(--app-text-soft);
}

.auth-form {
  margin-top: 8px;
}

.full-width,
.submit-button {
  width: 100%;
}

.send-code-button {
  min-width: 120px;
  border: none;
}

.links {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  color: var(--app-text-soft);
  font-size: 14px;
}

@media (max-width: 860px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-copy {
    padding: 28px;
  }

  .auth-card {
    padding: 28px 22px;
  }
}
</style>
