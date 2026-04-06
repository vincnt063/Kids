<template>
  <div class="progress-page">
    <header class="page-header">
      <div class="header-copy">
        <button type="button" class="back-home" @click="goHome">返回首页</button>
        <span class="eyebrow">学习进度与作品收藏</span>
        <h1>{{ welcomeTitle }}</h1>
        <p>这里会展示当前账号的闯关进度、拿到的星星，以及已经收藏到账号里的作品。</p>
      </div>

      <div class="header-actions">
        <div class="user-pill">当前账号：{{ currentUsername }}</div>
        <el-button size="large" @click="goToLevels">继续闯关</el-button>
        <el-button type="danger" plain size="large" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <section class="summary-grid">
      <article class="summary-card warm">
        <span>已经完成</span>
        <strong>{{ completedCount }}/{{ totalCount }} 关</strong>
        <p>完成率 {{ completionRate }}%，下一关会自动解锁。</p>
      </article>

      <article class="summary-card blue">
        <span>已经拿到</span>
        <strong>{{ totalStars }} 颗星星</strong>
        <p>每一关最高 3 星，可以反复挑战刷新成绩。</p>
      </article>

      <article class="summary-card green">
        <span>已收藏作品</span>
        <strong>{{ savedWorksCount }} 份</strong>
        <p>点开任意一份作品，就能继续回到对应关卡。</p>
      </article>

      <article class="summary-card rose">
        <span>当前等级</span>
        <strong>Lv.{{ currentLevel }}</strong>
        <p>累计积分 {{ totalPoints }}，学习进度会和账号同步。</p>
      </article>
    </section>

    <main class="content-grid">
      <section class="panel">
        <div class="section-head">
          <div>
            <span class="eyebrow blue">我的收藏</span>
            <h2>已收藏的作品</h2>
            <p>这些作品来自“收藏作品 -> 保存到账号”。</p>
          </div>
        </div>

        <div v-if="loadingRecords" class="empty-state">
          正在加载收藏作品...
        </div>

        <div v-else-if="records.length" class="record-list">
          <article v-for="item in records" :key="item.id" class="record-card">
            <div class="record-main">
              <div class="record-top">
                <strong>{{ item.workName || fallbackWorkName(item.caseId) }}</strong>
                <span class="case-pill">第 {{ item.caseId }} 关 · {{ caseTitle(item.caseId) }}</span>
              </div>
              <p>{{ item.result || '已保存到账号，可以继续回到这关修改。' }}</p>
              <div class="record-meta">
                <span>{{ formatRecordTime(item.updateTime || item.createTime) }}</span>
                <span>{{ formatStars(item.stars) }}</span>
              </div>
            </div>

            <div class="record-actions">
              <el-button type="primary" size="large" @click="continueCase(item.caseId)">
                继续这关
              </el-button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <strong>还没有收藏作品</strong>
          <p>去实验室点击“收藏作品”，保存到账号后就会出现在这里。</p>
          <el-button type="primary" size="large" @click="goToLevels">去选关卡</el-button>
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <span class="eyebrow gold">学习进度</span>
            <h2>闯关完成情况</h2>
            <p>已经完成的关卡会显示星级，没完成的关卡也会在这里保留位置。</p>
          </div>
        </div>

        <div class="case-grid">
          <article
            v-for="item in cases"
            :key="item.id"
            class="case-card"
            :class="{
              completed: progressStore.isCaseCompleted(item.id),
              locked: !progressStore.isCaseUnlocked(item.id)
            }"
          >
            <div class="case-head">
              <span class="case-index">第 {{ item.id }} 关</span>
              <span class="case-stars">{{ formatStars(progressStore.getCaseProgress(item.id).stars) }}</span>
            </div>
            <strong>{{ item.shortTitle }}</strong>
            <p>{{ caseStatusText(item.id) }}</p>
            <el-button
              size="large"
              :type="progressStore.isCaseCompleted(item.id) ? 'default' : 'primary'"
              :disabled="!progressStore.isCaseUnlocked(item.id)"
              @click="continueCase(item.id)"
            >
              {{ progressStore.isCaseCompleted(item.id) ? '再玩一次' : '去挑战' }}
            </el-button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserRecords } from '@/api/record'
import { useCaseStore } from '@/store/case'
import { useProgressStore } from '@/store/progress'
import { useSiteStore } from '@/store/site'
import { useUserStore } from '@/store/user'

const router = useRouter()
const caseStore = useCaseStore()
const progressStore = useProgressStore()
const siteStore = useSiteStore()
const userStore = useUserStore()
const loadingRecords = ref(false)
const records = ref([])

caseStore.initializeCases()
progressStore.loadLocalProgress(userStore.getUserId)

const loadRecords = async () => {
  if (!userStore.getUserId) {
    records.value = []
    return
  }

  loadingRecords.value = true

  try {
    const res = await getUserRecords(userStore.getUserId)
    const items = Array.isArray(res.data) ? res.data : []
    records.value = items.sort((left, right) => {
      const leftTime = new Date(left?.updateTime || left?.createTime || 0).getTime()
      const rightTime = new Date(right?.updateTime || right?.createTime || 0).getTime()
      return rightTime - leftTime
    })
  } catch (error) {
    records.value = []
  } finally {
    loadingRecords.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    caseStore.fetchCases(),
    siteStore.fetchOverview(),
    userStore.getUserId ? progressStore.fetchProgress(userStore.getUserId) : Promise.resolve()
  ])
  await loadRecords()
})

const cases = computed(() => caseStore.cases)
const totalCount = computed(() => {
  const activeCount = siteStore.getActiveCaseCount || cases.value.length
  return Math.min(activeCount, cases.value.length)
})
const completedCount = computed(() => progressStore.getCompletedCaseCount)
const completionRate = computed(() => {
  return totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0
})
const currentLevel = computed(() => progressStore.getCurrentLevel)
const totalPoints = computed(() => progressStore.getTotalPoints)
const totalStars = computed(() => {
  return Object.values(progressStore.caseProgress).reduce((sum, item) => sum + (item.stars || 0), 0)
})
const savedWorksCount = computed(() => records.value.length)
const currentUsername = computed(() => userStore.getUsername || '当前账号')
const welcomeTitle = computed(() => {
  return userStore.getUsername ? `${userStore.getUsername} 的学习记录` : '当前账号的学习记录'
})

const fallbackWorkName = (caseId) => `${caseTitle(caseId)} 作品`

const caseTitle = (caseId) => {
  return caseStore.getCaseById(caseId)?.shortTitle || `第 ${caseId} 关`
}

const caseStatusText = (caseId) => {
  if (!progressStore.isCaseUnlocked(caseId)) {
    return '先完成前一关，这关才会解锁。'
  }

  if (progressStore.isCaseCompleted(caseId)) {
    return '已经通关，可以回来刷新星级。'
  }

  return '还没有完成，现在可以继续挑战。'
}

const formatStars = (stars = 0) => {
  const safeStars = Math.max(0, Number(stars) || 0)
  return safeStars > 0 ? `★ ${safeStars}/3` : '★ 0/3'
}

const formatRecordTime = (value) => {
  if (!value) {
    return '刚刚保存'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '刚刚保存'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const goHome = () => {
  router.push('/')
}

const goToLevels = () => {
  router.push('/levels')
}

const continueCase = (caseId) => {
  router.push({
    path: '/lab',
    query: {
      caseId
    }
  })
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
</script>

<style scoped>
.progress-page {
  min-height: 100vh;
  padding: 24px;
  color: #22324c;
  background:
    radial-gradient(circle at top left, rgba(255, 207, 112, 0.2), transparent 20%),
    radial-gradient(circle at top right, rgba(92, 178, 255, 0.18), transparent 18%),
    linear-gradient(180deg, #fff9ef 0%, #eef6ff 48%, #f8fbff 100%);
}

.page-header,
.summary-card,
.panel,
.record-card,
.case-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(34, 50, 76, 0.08);
  box-shadow: 0 18px 34px rgba(45, 70, 112, 0.08);
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 18px;
  padding: 28px;
  border-radius: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.back-home {
  width: fit-content;
  padding: 9px 14px;
  border: none;
  border-radius: 999px;
  background: #f3f7fd;
  color: #32425e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.eyebrow {
  display: inline-flex;
  padding: 7px 14px;
  border-radius: 999px;
  background: #fff0d2;
  color: #a56b00;
  font-size: 13px;
  font-weight: 700;
}

.eyebrow.blue {
  background: #edf4ff;
  color: #356297;
}

.eyebrow.gold {
  background: #fff6df;
  color: #9a6d14;
}

.header-copy {
  display: grid;
  gap: 14px;
}

.header-copy h1 {
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.08;
}

.header-copy p,
.section-head p,
.record-main p,
.summary-card p,
.case-card p,
.empty-state p {
  margin: 0;
  color: #6b7c96;
  line-height: 1.75;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.user-pill {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: #f3f6fb;
  color: #48607d;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.summary-grid,
.content-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 20px;
  border-radius: 24px;
}

.summary-card span {
  color: #6c7d97;
  font-size: 13px;
}

.summary-card strong {
  display: block;
  margin: 10px 0 8px;
  font-size: 30px;
}

.summary-card.warm {
  background: linear-gradient(180deg, rgba(255, 248, 231, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card.blue {
  background: linear-gradient(180deg, rgba(237, 245, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card.green {
  background: linear-gradient(180deg, rgba(237, 250, 240, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card.rose {
  background: linear-gradient(180deg, rgba(255, 241, 240, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.content-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  gap: 14px;
}

.panel {
  padding: 22px;
  border-radius: 28px;
}

.section-head {
  margin-bottom: 16px;
}

.section-head h2 {
  margin: 12px 0 8px;
  font-size: 30px;
}

.record-list,
.case-grid {
  display: grid;
  gap: 12px;
}

.record-card {
  padding: 18px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.record-main {
  min-width: 0;
}

.record-top {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.record-top strong {
  font-size: 22px;
}

.case-pill,
.record-meta span,
.case-index,
.case-stars {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: #f3f6fb;
  color: #53647f;
  font-size: 12px;
  font-weight: 700;
}

.record-main p {
  margin-top: 10px;
}

.record-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.record-actions {
  flex-shrink: 0;
}

.case-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.case-card {
  padding: 18px;
  border-radius: 24px;
}

.case-card.completed {
  border-color: rgba(98, 191, 118, 0.34);
}

.case-card.locked {
  opacity: 0.56;
}

.case-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.case-card strong {
  display: block;
  margin: 14px 0 8px;
  font-size: 22px;
}

.case-card :deep(.el-button) {
  margin-top: 14px;
  width: 100%;
}

.empty-state {
  min-height: 220px;
  border-radius: 24px;
  background: #f8fbff;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
  padding: 24px;
}

.empty-state strong {
  font-size: 24px;
}

@media (max-width: 1040px) {
  .summary-grid,
  .content-grid,
  .case-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .progress-page {
    padding: 14px;
  }

  .page-header,
  .header-actions,
  .record-card {
    flex-direction: column;
    align-items: stretch;
  }

  .user-pill {
    justify-content: center;
  }

  .record-actions :deep(.el-button),
  .header-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
