<template>
  <div class="home-page">
    <div class="page-glow glow-a"></div>
    <div class="page-glow glow-b"></div>

    <header class="topbar">
      <div class="brand" @click="goHome">
        <span class="brand-mark">K</span>
        <div>
          <strong>Kids Programming Lab</strong>
          <p>拖一拖积木，角色就会动起来</p>
        </div>
      </div>

      <nav class="nav">
        <button type="button" @click="goToLevels">选关卡</button>
        <button type="button" @click="goToPath">学习地图</button>
        <span v-if="isLoggedIn" class="user-pill">当前账号：{{ currentUsername }}</span>
        <button type="button" class="soft" @click="goToAccount">
          {{ accountActionLabel }}
        </button>
        <button v-if="isLoggedIn" type="button" class="soft danger" @click="handleLogout">退出登录</button>
      </nav>
    </header>

    <main class="container">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">不用登录也能玩，进度会自动保存在这台电脑里</span>
          <h1>拖一拖积木，<br>帮小角色完成任务</h1>
          <p class="hero-text">
            从基础移动、坐标定位到重复、条件判断、信号分支和等待控制，每一关只推进一个编程重点，让孩子更容易看懂、上手和获得成就感。
          </p>

          <div class="hero-actions">
            <el-button type="primary" size="large" @click="startAdventure">
              {{ primaryActionLabel }}
            </el-button>
            <el-button size="large" @click="goToLevels">看看全部关卡</el-button>
          </div>

          <div class="hero-pills">
            <span>推荐关卡：{{ recommendedCase.shortTitle }}</span>
            <span>已完成 {{ completedCount }}/{{ totalCount }} 关</span>
            <span>最多可拿 {{ maxStars }} 颗星星</span>
          </div>
        </div>

        <div class="hero-stage">
          <div class="stage-card">
            <div class="stage-head">
              <span class="stage-badge">今天先做</span>
              <strong>{{ recommendedCase.shortTitle }}</strong>
            </div>

            <div class="stage-playground">
              <div class="cloud cloud-a"></div>
              <div class="cloud cloud-b"></div>
              <div class="stage-star star-a">⭐</div>
              <div class="stage-star star-b">⭐</div>
              <div class="stage-home">{{ recommendedCase.coverEmoji }}</div>
              <div class="stage-cat">🐱</div>
            </div>

            <div class="stage-footer">
              <article>
                <span>这关会学</span>
                <strong>{{ recommendedCase.knowledgePoints.join(' / ') }}</strong>
              </article>
              <article>
                <span>操作步骤</span>
                <strong>拖积木 -> 点运行 -> 看结果</strong>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-start">
        <article v-for="item in starterCards" :key="item.title" class="starter-card">
          <div class="starter-icon">{{ item.icon }}</div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </article>
      </section>

      <section class="feature-panel">
        <div class="feature-copy">
          <span class="eyebrow blue">孩子更容易上手的原因</span>
          <h2>每个页面都只做一件事</h2>
          <p>
            首页负责开始，关卡页负责选择，实验室负责拖积木和看结果。入口短、按钮大、提示明确，不需要记住太多规则。
          </p>
        </div>

        <div class="feature-list">
          <article v-for="item in features" :key="item.title" class="feature-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCaseStore } from '@/store/case'
import { useProgressStore } from '@/store/progress'
import { useSiteStore } from '@/store/site'
import { useUserStore } from '@/store/user'

const router = useRouter()
const caseStore = useCaseStore()
const progressStore = useProgressStore()
const siteStore = useSiteStore()
const userStore = useUserStore()

caseStore.initializeCases()
progressStore.loadLocalProgress(userStore.getUserId)

onMounted(async () => {
  await caseStore.fetchCases()
  siteStore.fetchOverview()
  if (userStore.getUserId) {
    progressStore.fetchProgress(userStore.getUserId)
  }
})

const isLoggedIn = computed(() => userStore.isLoggedIn || !!userStore.token)
const isParentAccount = computed(() => userStore.getUserRole === 'parent')
const currentUsername = computed(() => userStore.getUsername || '当前账号')
const cases = computed(() => caseStore.cases)
const totalCount = computed(() => {
  const activeCount = siteStore.getActiveCaseCount || cases.value.length
  return Math.min(activeCount, cases.value.length)
})
const completedCount = computed(() => progressStore.getCompletedCaseCount)
const maxStars = computed(() => totalCount.value * 3)

const recommendedCase = computed(() => {
  return cases.value.find((item) => progressStore.isCaseUnlocked(item.id) && !progressStore.isCaseCompleted(item.id)) || caseStore.currentCase
})

const primaryActionLabel = computed(() => {
  if (isParentAccount.value) {
    return '进入家长中心'
  }

  if (!recommendedCase.value.shortTitle) {
    return '开始体验'
  }

  return completedCount.value > 0 ? `继续：${recommendedCase.value.shortTitle}` : '从第一关开始'
})

const accountActionLabel = computed(() => {
  if (!isLoggedIn.value) {
    return '登录'
  }

  return isParentAccount.value ? '家长中心' : '学习进度'
})

const starterCards = [
  {
    icon: '🧩',
    title: '先拖积木',
    description: '把动作积木接到“点击开始”下面，像拼图一样连起来。'
  },
  {
    icon: '▶️',
    title: '再点运行',
    description: '角色会按照你的顺序动起来，马上看到结果。'
  },
  {
    icon: '🏆',
    title: '拿星星奖励',
    description: '完成任务就能过关，做得更好还能拿更多星星。'
  }
]

const features = [
  {
    title: '入口更短',
    description: '现在可以直接试玩，不用先登录。'
  },
  {
    title: '提示更直白',
    description: '每关都会告诉孩子先用哪些积木、分几步完成。'
  },
  {
    title: '保存更省心',
    description: '操作过程会自动保存，关掉页面也不容易丢。'
  }
]

const goHome = () => {
  router.push('/')
}

const goToLevels = () => {
  router.push('/levels')
}

const goToPath = () => {
  router.push('/path')
}

const goToAccount = () => {
  router.push(
    isLoggedIn.value
      ? (isParentAccount.value ? '/parent-progress' : '/progress')
      : '/login'
  )
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    .then(async () => {
      await userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    })
    .catch(() => {})
}

const startAdventure = () => {
  if (isParentAccount.value) {
    router.push('/parent-progress')
    return
  }

  router.push({
    path: '/lab',
    query: {
      caseId: recommendedCase.value.id
    }
  })
}
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  overflow: hidden;
  color: #20314a;
  background:
    radial-gradient(circle at 15% 15%, rgba(255, 211, 119, 0.35), transparent 22%),
    radial-gradient(circle at 88% 22%, rgba(94, 197, 255, 0.26), transparent 20%),
    linear-gradient(180deg, #fff9ed 0%, #eef7ff 48%, #f8fbff 100%);
}

.page-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  pointer-events: none;
}

.glow-a {
  top: 120px;
  left: -50px;
  width: 220px;
  height: 220px;
  background: rgba(255, 190, 92, 0.2);
}

.glow-b {
  right: -70px;
  bottom: 100px;
  width: 240px;
  height: 240px;
  background: rgba(95, 171, 255, 0.2);
}

.topbar,
.hero,
.starter-card,
.feature-panel,
.feature-card,
.stage-card {
  position: relative;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(32, 49, 74, 0.08);
  box-shadow: 0 18px 34px rgba(45, 70, 112, 0.08);
  backdrop-filter: blur(10px);
}

.topbar {
  max-width: 1160px;
  margin: 0 auto 18px;
  padding: 16px 18px;
  border-radius: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-mark {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff9e53 0%, #ffd05f 100%);
  color: white;
  font-size: 24px;
  font-weight: 800;
}

.brand strong {
  display: block;
  font-size: 18px;
}

.brand p {
  margin: 4px 0 0;
  color: #70819c;
  font-size: 13px;
}

.nav {
  display: flex;
  gap: 10px;
}

.nav .user-pill {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: #f5f8ff;
  color: #48617f;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.nav button {
  min-height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #fff7e9;
  color: #20314a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.nav button:hover {
  transform: translateY(-1px);
  background: #fff0d1;
}

.nav button.soft {
  background: #eef5ff;
}

.nav button.soft.danger {
  background: #fff2ef;
  color: #a14a3f;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
}

.hero {
  padding: 30px;
  border-radius: 34px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 22px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  background: #fff0d1;
  color: #a56a00;
  font-size: 13px;
  font-weight: 700;
}

.eyebrow.blue {
  background: #edf4ff;
  color: #3263a1;
}

.hero-copy h1 {
  margin: 18px 0 14px;
  font-size: clamp(40px, 5vw, 62px);
  line-height: 1.02;
}

.hero-text {
  max-width: 600px;
  margin: 0;
  color: #667892;
  line-height: 1.8;
  font-size: 17px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin: 28px 0 22px;
}

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-pills span {
  padding: 10px 14px;
  border-radius: 999px;
  background: #f5f8ff;
  color: #48617f;
  font-size: 13px;
  font-weight: 600;
}

.hero-stage {
  display: flex;
}

.stage-card {
  flex: 1;
  padding: 18px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(243, 249, 255, 0.94) 100%);
}

.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stage-badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef7ea;
  color: #4c8b45;
  font-size: 12px;
  font-weight: 700;
}

.stage-head strong {
  font-size: 20px;
}

.stage-playground {
  position: relative;
  min-height: 260px;
  margin: 16px 0;
  border-radius: 24px;
  overflow: hidden;
  background:
    linear-gradient(180deg, #bfe5ff 0%, #d8f0ff 45%, #fff5de 45%, #fff2cf 100%);
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: inherit;
}

.cloud-a {
  top: 34px;
  left: 44px;
  width: 78px;
  height: 30px;
}

.cloud-a::before {
  width: 34px;
  height: 34px;
  left: 10px;
  top: -14px;
}

.cloud-a::after {
  width: 28px;
  height: 28px;
  right: 12px;
  top: -10px;
}

.cloud-b {
  top: 62px;
  right: 52px;
  width: 96px;
  height: 34px;
}

.cloud-b::before {
  width: 38px;
  height: 38px;
  left: 12px;
  top: -16px;
}

.cloud-b::after {
  width: 30px;
  height: 30px;
  right: 16px;
  top: -10px;
}

.stage-star,
.stage-home,
.stage-cat {
  position: absolute;
}

.stage-star {
  font-size: 28px;
}

.star-a {
  left: 76px;
  top: 110px;
}

.star-b {
  right: 84px;
  top: 126px;
}

.stage-home {
  right: 42px;
  bottom: 38px;
  font-size: 42px;
}

.stage-cat {
  left: 46px;
  bottom: 34px;
  font-size: 52px;
}

.stage-footer {
  display: grid;
  gap: 12px;
}

.stage-footer article {
  padding: 12px 14px;
  border-radius: 18px;
  background: #f7faff;
}

.stage-footer span {
  display: block;
  color: #71849c;
  font-size: 12px;
}

.stage-footer strong {
  display: block;
  margin-top: 6px;
  font-size: 16px;
  line-height: 1.5;
}

.quick-start {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.starter-card {
  padding: 22px;
  border-radius: 26px;
}

.starter-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #ffca63 0%, #ff9a53 100%);
  font-size: 28px;
}

.starter-card h2,
.feature-copy h2 {
  margin: 16px 0 10px;
  font-size: 28px;
}

.starter-card p,
.feature-copy p,
.feature-card p {
  margin: 0;
  color: #667892;
  line-height: 1.8;
}

.feature-panel {
  margin-top: 18px;
  padding: 24px;
  border-radius: 30px;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 16px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.feature-card {
  padding: 18px;
  border-radius: 22px;
  background: #f8fbff;
}

.feature-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 22px;
}

@media (max-width: 980px) {
  .hero,
  .quick-start,
  .feature-panel,
  .feature-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .home-page {
    padding: 14px;
  }

  .topbar,
  .nav,
  .hero-actions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .nav .user-pill {
    width: 100%;
  }

  .hero {
    padding: 22px;
  }

  .hero-copy h1 {
    font-size: 38px;
  }

  .stage-playground {
    min-height: 220px;
  }
}
</style>
