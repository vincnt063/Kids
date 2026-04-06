<template>
  <div class="levels-page">
    <header class="page-header">
      <div class="header-copy">
        <span class="eyebrow">按顺序完成前一关，下一关就会自动解锁</span>
        <h1>选一个小任务，开始闯关</h1>
        <p>每关只练一个重点。不会做也没关系，右边实验室会继续给你提示。</p>
      </div>

      <div class="header-actions">
        <el-button size="large" @click="goHome">返回首页</el-button>
        <div v-if="isLoggedIn" class="user-pill">当前账号：{{ currentUsername }}</div>
        <el-button v-if="isLoggedIn" size="large" @click="goToProgress">学习进度</el-button>
        <el-button v-if="isLoggedIn" size="large" plain @click="handleLogout">退出登录</el-button>
        <el-button type="primary" size="large" @click="startLatestCase">
          {{ completedCount > 0 ? `继续 ${recommendedCase.shortTitle}` : '从第一关开始' }}
        </el-button>
      </div>
    </header>

    <section class="summary-row">
      <article class="summary-card warm">
        <span>已经完成</span>
        <strong>{{ completedCount }}/{{ totalCount }} 关</strong>
        <p>完成一关，就会自动记录下来。</p>
      </article>
      <article class="summary-card blue">
        <span>已经拿到</span>
        <strong>{{ totalStars }} 颗星星</strong>
        <p>做得越完整，得到的星星越多。</p>
      </article>
      <article class="summary-card green">
        <span>推荐下一步</span>
        <strong>{{ recommendedCase.shortTitle }}</strong>
        <p>{{ recommendedCase.helperText }}</p>
      </article>
    </section>

    <main class="levels-grid">
      <article
        v-for="item in cases"
        :key="item.id"
        class="level-card"
        :class="{
          locked: !isCaseUnlocked(item.id),
          completed: progressStore.isCaseCompleted(item.id),
          active: item.id === recommendedCase.id
        }"
      >
        <div class="card-head">
          <div class="head-left">
            <div class="icon-badge" :style="{ background: cardTone(item.id) }">
              {{ item.coverEmoji }}
            </div>
            <div>
              <small>第 {{ item.id }} 关</small>
              <h2>{{ item.shortTitle }}</h2>
            </div>
          </div>
          <span class="difficulty">{{ item.difficultyLabel }}</span>
        </div>

        <p class="description">{{ item.description }}</p>

        <div class="goal-box">
          <span>任务目标</span>
          <strong>{{ item.goal }}</strong>
        </div>

        <div class="info-row">
          <article class="mini-card">
            <span>建议积木</span>
            <strong>{{ item.focusBlocks.join(' / ') }}</strong>
          </article>
          <article class="mini-card">
            <span>当前星级</span>
            <strong>{{ getStars(item.id) }} / 3</strong>
          </article>
        </div>

        <div class="steps">
          <span v-for="step in item.taskSteps" :key="step">{{ step }}</span>
        </div>

        <div class="card-footer">
          <div class="status-copy">
            <strong>{{ statusText(item.id) }}</strong>
            <p>{{ statusHint(item) }}</p>
          </div>

          <el-button
            type="primary"
            size="large"
            :plain="progressStore.isCaseCompleted(item.id)"
            :disabled="!isCaseUnlocked(item.id)"
            @click="goToCase(item.id)"
          >
            {{ progressStore.isCaseCompleted(item.id) ? '再玩一次' : '开始挑战' }}
          </el-button>
        </div>
      </article>
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

const cases = computed(() => caseStore.cases)
const totalCount = computed(() => {
  const activeCount = siteStore.getActiveCaseCount || cases.value.length
  return Math.min(activeCount, cases.value.length)
})
const completedCount = computed(() => progressStore.getCompletedCaseCount)
const totalStars = computed(() => {
  return Object.values(progressStore.caseProgress).reduce((sum, item) => sum + (item.stars || 0), 0)
})
const isLoggedIn = computed(() => userStore.isLoggedIn || !!userStore.token)
const isParentAccount = computed(() => userStore.getUserRole === 'parent')
const currentUsername = computed(() => userStore.getUsername || '当前账号')

const recommendedCase = computed(() => {
  return cases.value.find((item) => progressStore.isCaseUnlocked(item.id) && !progressStore.isCaseCompleted(item.id)) || caseStore.currentCase
})

const getStars = (caseId) => {
  return progressStore.getCaseProgress(caseId).stars
}

const isCaseUnlocked = (caseId) => {
  return progressStore.isCaseUnlocked(caseId)
}

const statusText = (caseId) => {
  if (!isCaseUnlocked(caseId)) {
    return '还没解锁'
  }

  return progressStore.isCaseCompleted(caseId) ? '已经通关' : '现在可以挑战'
}

const statusHint = (item) => {
  if (!isCaseUnlocked(item.id)) {
    return `先完成第 ${item.id - 1} 关，再回来挑战这关。`
  }

  return progressStore.isCaseCompleted(item.id) ? '你可以回来刷新星级，拿到更多奖励。' : item.helperText
}

const cardTone = (caseId) => {
  const tones = {
    1: 'linear-gradient(135deg, #ffe6c8 0%, #fff4de 100%)',
    2: 'linear-gradient(135deg, #e6f7ee 0%, #f2fff6 100%)',
    3: 'linear-gradient(135deg, #ffe7eb 0%, #fff5f7 100%)',
    4: 'linear-gradient(135deg, #e8f3ff 0%, #f3f8ff 100%)',
    5: 'linear-gradient(135deg, #fff2d1 0%, #fff9e8 100%)',
    6: 'linear-gradient(135deg, #ede7ff 0%, #f7f2ff 100%)',
    7: 'linear-gradient(135deg, #e5fbff 0%, #f1fdff 100%)',
    8: 'linear-gradient(135deg, #e9fff0 0%, #f7fff9 100%)',
    9: 'linear-gradient(135deg, #fff0e9 0%, #fff8f4 100%)'
  }

  return tones[caseId] || tones[1]
}

const goHome = () => {
  router.push('/')
}

const goToProgress = () => {
  router.push(isParentAccount.value ? '/parent-progress' : '/progress')
}

const goToCase = (caseId) => {
  router.push({
    path: '/lab',
    query: {
      caseId
    }
  })
}

const startLatestCase = () => {
  goToCase(recommendedCase.value.id)
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
.levels-page {
  min-height: 100vh;
  padding: 24px;
  color: #22324c;
  background:
    radial-gradient(circle at top left, rgba(255, 203, 112, 0.24), transparent 22%),
    linear-gradient(180deg, #fff9ef 0%, #f1f8ff 56%, #f8fbff 100%);
}

.page-header,
.summary-card,
.level-card,
.mini-card,
.goal-box {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(34, 50, 76, 0.08);
  box-shadow: 0 18px 34px rgba(45, 70, 112, 0.08);
}

.page-header {
  max-width: 1160px;
  margin: 0 auto 18px;
  padding: 28px;
  border-radius: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
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

.page-header h1 {
  margin: 16px 0 8px;
  font-size: clamp(34px, 4vw, 54px);
}

.page-header p,
.description,
.status-copy p,
.summary-card p {
  margin: 0;
  color: #697a94;
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

.summary-row,
.levels-grid {
  max-width: 1160px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.summary-row {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 18px;
}

.summary-card {
  padding: 20px;
  border-radius: 24px;
}

.summary-card.warm {
  background: linear-gradient(180deg, rgba(255, 249, 234, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card.blue {
  background: linear-gradient(180deg, rgba(238, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card.green {
  background: linear-gradient(180deg, rgba(237, 249, 239, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.summary-card span {
  color: #697a94;
  font-size: 13px;
}

.summary-card strong {
  display: block;
  margin: 8px 0;
  font-size: 30px;
}

.levels-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.level-card {
  padding: 22px;
  border-radius: 28px;
}

.level-card.locked {
  opacity: 0.56;
}

.level-card.completed {
  border-color: rgba(104, 193, 118, 0.34);
}

.level-card.active {
  border-color: rgba(255, 166, 64, 0.38);
  box-shadow: 0 18px 36px rgba(255, 174, 77, 0.14);
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-badge {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  font-size: 32px;
}

.head-left small {
  color: #70819c;
  font-size: 12px;
  font-weight: 700;
}

.head-left h2 {
  margin: 8px 0 0;
  font-size: 28px;
}

.difficulty {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: #f3f6fb;
  color: #51637f;
  font-size: 12px;
  font-weight: 700;
}

.description {
  margin-top: 16px;
}

.goal-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #fffdf8;
}

.goal-box span,
.mini-card span {
  display: block;
  color: #71839c;
  font-size: 12px;
}

.goal-box strong,
.mini-card strong {
  display: block;
  margin-top: 6px;
  font-size: 16px;
  line-height: 1.6;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.mini-card {
  padding: 12px 14px;
  border-radius: 18px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.steps span {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef4ff;
  color: #375f97;
  font-size: 12px;
  font-weight: 700;
}

.card-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(34, 50, 76, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
}

.status-copy strong {
  display: block;
  margin-bottom: 6px;
  font-size: 20px;
}

@media (max-width: 980px) {
  .page-header,
  .summary-row,
  .levels-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 720px) {
  .levels-page {
    padding: 14px;
  }

  .header-actions,
  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .user-pill {
    justify-content: center;
  }

  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>
