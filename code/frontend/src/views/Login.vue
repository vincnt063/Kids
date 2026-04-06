<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="auth-copy">
        <router-link to="/" class="back-home">返回首页</router-link>
        <span class="auth-kicker">Kids Programming Lab</span>
        <h1>登录后继续进入学习或家长管理</h1>
        <p>学生可以继续闯关，家长可以绑定学生账号、查看学习进度并管理账号状态。</p>

        <div class="auth-points">
          <span>{{ caseCountLabel }}</span>
          <span>Blockly 拖拽编程</span>
          <span>家长绑定学生</span>
        </div>
      </section>

      <section class="auth-card">
        <div class="card-header">
          <h2>登录</h2>
          <p>输入账号后继续体验。</p>
        </div>

        <el-form ref="loginFormRef" :model="form" :rules="rules" class="auth-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              :prefix-icon="User"
              placeholder="请输入用户名"
              size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              size="large"
              class="submit-button"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="links">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import { useProgressStore } from '@/store/progress'
import { useSiteStore } from '@/store/site'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref(null)
const loading = ref(false)
const progressStore = useProgressStore()
const siteStore = useSiteStore()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  siteStore.fetchOverview()
})

const caseCountLabel = computed(() => {
  const activeCount = siteStore.getActiveCaseCount || 0
  return activeCount > 0 ? `${activeCount} 个渐进关卡` : '关卡数据加载中'
})

const resolveRedirectPath = (user) => {
  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirectPath) {
    return redirectPath
  }

  if (user?.role === 'admin') {
    return '/admin'
  }

  if (user?.role === 'parent') {
    return '/parent-progress'
  }

  return '/levels'
}

const handleLogin = async () => {
  if (!loginFormRef.value) {
    return
  }

  try {
    await loginFormRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true

  try {
    const res = await login(form)

    if (res.code !== 200) {
      ElMessage.error(res.message || '登录失败，请稍后重试')
      return
    }

    userStore.setSession(res.data.token, res.data.user)
    await progressStore.fetchProgress(res.data.user.id)

    ElMessage.success('登录成功')
    router.push(resolveRedirectPath(res.data.user))
  } catch (error) {
    if (!error.handled) {
      ElMessage.error(error.message || '登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
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
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
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
  max-width: 460px;
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

.submit-button {
  width: 100%;
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
