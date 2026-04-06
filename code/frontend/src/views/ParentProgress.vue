<template>
  <div class="parent-page">
    <header class="page-header">
      <div class="header-copy">
        <button type="button" class="back-home" @click="goHome">返回首页</button>
        <span class="eyebrow">家长中心</span>
        <h1>{{ currentUsername }} 的学生管理</h1>
        <p>绑定学生账号后，可以查看学习进度、最近学习记录，并冻结或启用学生账号。</p>
      </div>

      <div class="header-actions">
        <div class="user-pill">当前账号：{{ currentUsername }}</div>
        <el-button type="danger" plain size="large" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <section class="summary-grid">
      <article class="summary-card">
        <span>已绑定学生</span>
        <strong>{{ students.length }}/{{ maxStudents }}</strong>
        <p>每个家长账号最多绑定 3 个学生账号。</p>
      </article>
      <article class="summary-card">
        <span>可继续绑定</span>
        <strong>{{ remainingStudents }}</strong>
        <p>绑定时必须输入学生账号和密码。</p>
      </article>
      <article class="summary-card">
        <span>已启用</span>
        <strong>{{ enabledStudents }}</strong>
        <p>启用中的学生可以继续正常登录学习。</p>
      </article>
      <article class="summary-card">
        <span>已冻结</span>
        <strong>{{ frozenStudents }}</strong>
        <p>冻结后学生登录会被拦截，家长可随时恢复。</p>
      </article>
    </section>

    <main class="top-grid">
      <section class="panel">
        <div class="section-head">
          <span class="eyebrow soft">绑定学生</span>
          <h2>输入学生账号和密码</h2>
          <p>为了确认绑定关系，家长需要填写学生账号和密码进行校验。</p>
        </div>

        <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" label-position="top">
          <el-form-item label="学生账号" prop="studentUsername">
            <el-input
              v-model="bindForm.studentUsername"
              size="large"
              placeholder="请输入学生账号"
              :disabled="!canBindMore"
            />
          </el-form-item>

          <el-form-item label="学生密码" prop="studentPassword">
            <el-input
              v-model="bindForm.studentPassword"
              type="password"
              size="large"
              placeholder="请输入学生密码"
              show-password
              :disabled="!canBindMore"
              @keyup.enter="handleBind"
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="full-width"
            :loading="bindingLoading"
            :disabled="!canBindMore"
            @click="handleBind"
          >
            {{ canBindMore ? '绑定学生账号' : '已达到绑定上限' }}
          </el-button>
        </el-form>
      </section>

      <section class="panel">
        <div class="section-head">
          <span class="eyebrow soft">操作说明</span>
          <h2>家长可查看并管理账号</h2>
          <p>页面会展示每个学生的完成关卡、累计星级、最近学习记录，以及当前账号状态。</p>
        </div>

        <div class="tips">
          <article class="tip-card">
            <strong>查看进度</strong>
            <p>完成关卡数、总星级、等级和每关状态都会直接显示。</p>
          </article>
          <article class="tip-card">
            <strong>管理账号</strong>
            <p>每个已绑定学生都可以单独冻结或重新启用。</p>
          </article>
          <article class="tip-card">
            <strong>演示账号</strong>
            <p><strong>parent_demo / parent123</strong> 已预绑定 <strong>all_pass_demo / 123456</strong>。</p>
          </article>
        </div>
      </section>
    </main>

    <section class="students-panel">
      <div class="section-head">
        <span class="eyebrow soft">已绑定学生</span>
        <h2>学习进度与账号状态</h2>
        <p>每个学生都会显示学习概览、分关卡状态和最近学习记录。</p>
      </div>

      <div v-if="loading" class="empty-state">正在加载学生数据...</div>
      <div v-else-if="students.length" class="student-list">
        <article v-for="student in students" :key="student.bindingId || student.studentId" class="student-card">
          <div class="student-head">
            <div>
              <div class="student-title">
                <strong>{{ student.studentUsername }}</strong>
                <span class="status-tag" :class="student.status === 1 ? 'enabled' : 'frozen'">
                  {{ student.status === 1 ? '已启用' : '已冻结' }}
                </span>
              </div>
              <p>已完成 {{ getCompletedCases(student) }}/{{ totalCount }} 关，累计 {{ getTotalStars(student) }} 颗星星。</p>
            </div>

            <el-button
              :type="student.status === 1 ? 'danger' : 'success'"
              plain
              size="large"
              :loading="updatingStudentId === student.studentId"
              @click="toggleStudentStatus(student)"
            >
              {{ student.status === 1 ? '冻结账号' : '启用账号' }}
            </el-button>
          </div>

          <div class="student-summary">
            <article class="mini-card">
              <span>完成率</span>
              <strong>{{ getCompletionRate(student) }}%</strong>
            </article>
            <article class="mini-card">
              <span>等级</span>
              <strong>Lv.{{ student.progress.currentLevel || 1 }}</strong>
            </article>
            <article class="mini-card">
              <span>积分</span>
              <strong>{{ student.progress.totalPoints || 0 }}</strong>
            </article>
            <article class="mini-card">
              <span>最近记录</span>
              <strong>{{ student.progress.totalWorks || student.records.length }}</strong>
            </article>
          </div>

          <div class="student-grid">
            <section class="student-block">
              <h3>关卡进度</h3>
              <div class="case-grid">
                <article
                  v-for="item in cases"
                  :key="`${student.studentId}-${item.id}`"
                  class="case-item"
                  :class="{ completed: !!student.caseProgressMap[item.id]?.completed }"
                >
                  <span>第 {{ item.id }} 关</span>
                  <strong>{{ item.shortTitle }}</strong>
                  <p>{{ student.caseProgressMap[item.id]?.completed ? formatStars(student.caseProgressMap[item.id].stars) : '未完成' }}</p>
                </article>
              </div>
            </section>

            <section class="student-block">
              <h3>最近学习记录</h3>
              <div v-if="student.records.length" class="record-list">
                <article v-for="record in student.records" :key="record.id" class="record-card">
                  <strong>{{ record.workName || fallbackWorkName(record.caseId) }}</strong>
                  <p>{{ caseTitle(record.caseId) }} · {{ formatStars(record.stars) }}</p>
                  <span>{{ formatRecordTime(record.updateTime || record.createTime) }}</span>
                </article>
              </div>
              <div v-else class="empty-inner">还没有学习记录</div>
            </section>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        还没有绑定学生账号，请先在上方输入学生账号和密码完成绑定。
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { bindStudentAccount, getBoundStudents, updateBoundStudentStatus } from '@/api/user'
import { useCaseStore } from '@/store/case'
import { useSiteStore } from '@/store/site'
import { useUserStore } from '@/store/user'

const maxStudents = 3
const router = useRouter()
const caseStore = useCaseStore()
const siteStore = useSiteStore()
const userStore = useUserStore()

const loading = ref(false)
const bindingLoading = ref(false)
const updatingStudentId = ref(null)
const students = ref([])
const bindFormRef = ref(null)
const bindForm = reactive({ studentUsername: '', studentPassword: '' })

const bindRules = {
  studentUsername: [{ required: true, message: '请输入学生账号', trigger: 'blur' }],
  studentPassword: [{ required: true, message: '请输入学生密码', trigger: 'blur' }]
}

caseStore.initializeCases()

const cases = computed(() => caseStore.cases)
const currentUsername = computed(() => userStore.getUsername || '家长账号')
const totalCount = computed(() => Math.min(siteStore.getActiveCaseCount || cases.value.length, cases.value.length))
const remainingStudents = computed(() => Math.max(0, maxStudents - students.value.length))
const enabledStudents = computed(() => students.value.filter((item) => item.status === 1).length)
const frozenStudents = computed(() => students.value.filter((item) => item.status === 0).length)
const canBindMore = computed(() => students.value.length < maxStudents)

const normalizeStudent = (item) => {
  const caseProgressMap = (item.caseProgress || []).reduce((result, entry) => {
    if (entry?.caseId) {
      result[entry.caseId] = entry
    }
    return result
  }, {})

  return {
    ...item,
    progress: {
      totalCases: 0,
      totalTime: 0,
      totalWorks: 0,
      currentLevel: 1,
      totalPoints: 0,
      ...(item.progress || {})
    },
    caseProgressMap,
    records: Array.isArray(item.records) ? item.records : []
  }
}

const loadStudents = async () => {
  loading.value = true
  try {
    const res = await getBoundStudents(userStore.getUserId)
    students.value = Array.isArray(res.data) ? res.data.map(normalizeStudent) : []
  } catch (error) {
    students.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([caseStore.fetchCases(), siteStore.fetchOverview()])
  await loadStudents()
})

const getCompletedCases = (student) => student.progress.totalCases || Object.keys(student.caseProgressMap).length
const getTotalStars = (student) => Object.values(student.caseProgressMap).reduce((sum, item) => sum + (item.stars || 0), 0)
const getCompletionRate = (student) => (totalCount.value ? Math.round((getCompletedCases(student) / totalCount.value) * 100) : 0)
const caseTitle = (caseId) => caseStore.getCaseById(caseId)?.shortTitle || `第 ${caseId} 关`
const fallbackWorkName = (caseId) => `${caseTitle(caseId)} 作品`
const formatStars = (stars = 0) => (Number(stars) > 0 ? `★ ${stars}/3` : '★ 0/3')
const formatRecordTime = (value) => (value ? String(value).replace('T', ' ') : '刚刚保存')

const handleBind = async () => {
  if (!bindFormRef.value || !canBindMore.value) {
    return
  }

  try {
    await bindFormRef.value.validate()
  } catch (error) {
    return
  }

  bindingLoading.value = true
  try {
    await bindStudentAccount({
      parentId: userStore.getUserId,
      studentUsername: bindForm.studentUsername.trim(),
      studentPassword: bindForm.studentPassword.trim()
    })
    bindForm.studentUsername = ''
    bindForm.studentPassword = ''
    bindFormRef.value.resetFields()
    ElMessage.success('绑定成功')
    await loadStudents()
  } catch (error) {
    if (!error.handled) {
      ElMessage.error(error.message || '绑定失败，请稍后重试')
    }
  } finally {
    bindingLoading.value = false
  }
}

const toggleStudentStatus = (student) => {
  const nextStatus = student.status === 1 ? 0 : 1
  const actionText = nextStatus === 0 ? '冻结' : '启用'

  ElMessageBox.confirm(`确定要${actionText} ${student.studentUsername} 吗？`, '提示', { type: 'warning' })
    .then(async () => {
      updatingStudentId.value = student.studentId
      try {
        await updateBoundStudentStatus(userStore.getUserId, student.studentId, { status: nextStatus })
        ElMessage.success(`已${actionText}学生账号`)
        await loadStudents()
      } catch (error) {
        if (!error.handled) {
          ElMessage.error(error.message || `${actionText}失败，请稍后重试`)
        }
      } finally {
        updatingStudentId.value = null
      }
    })
    .catch(() => {})
}

const goHome = () => router.push('/')
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
.parent-page {
  min-height: 100vh;
  padding: 24px;
  color: #22324c;
  background: linear-gradient(180deg, #fff9ef 0%, #eef6ff 48%, #f8fbff 100%);
}

.page-header,
.summary-card,
.panel,
.student-card,
.tip-card,
.mini-card,
.case-item,
.record-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(34, 50, 76, 0.08);
  box-shadow: 0 18px 34px rgba(45, 70, 112, 0.08);
  border-radius: 24px;
}

.page-header,
.summary-grid,
.top-grid,
.students-panel {
  max-width: 1200px;
  margin: 0 auto 18px;
}

.page-header,
.student-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  padding: 28px;
  align-items: center;
}

.header-copy,
.section-head,
.tips,
.student-list,
.case-grid,
.record-list {
  display: grid;
  gap: 14px;
}

.header-copy h1,
.section-head h2 {
  margin: 0;
}

.eyebrow,
.status-tag,
.user-pill {
  display: inline-flex;
  width: fit-content;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.eyebrow {
  background: #edf4ff;
  color: #356297;
}

.eyebrow.soft {
  background: #fff4de;
  color: #9f6b17;
}

.back-home {
  width: fit-content;
  padding: 9px 14px;
  border: none;
  border-radius: 999px;
  background: #f3f7fd;
  color: #32425e;
  font-weight: 700;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-pill {
  background: #f3f6fb;
  color: #48607d;
}

.summary-grid,
.student-summary,
.top-grid,
.student-grid {
  display: grid;
  gap: 14px;
}

.summary-grid,
.student-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.top-grid,
.student-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-card,
.panel,
.students-panel,
.student-card,
.tip-card,
.mini-card,
.case-item,
.record-card {
  padding: 18px;
}

.summary-card strong,
.mini-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
}

.full-width {
  width: 100%;
}

.tip-card strong,
.student-title strong,
.case-item strong,
.record-card strong {
  display: block;
}

.students-panel {
  padding: 22px;
}

.student-card {
  display: grid;
  gap: 16px;
}

.student-title {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.status-tag.enabled {
  background: #edf9ef;
  color: #2d8c45;
}

.status-tag.frozen {
  background: #fff1ef;
  color: #b05848;
}

.case-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.case-item.completed {
  background: linear-gradient(180deg, rgba(239, 250, 241, 0.98) 0%, rgba(255, 255, 255, 0.96) 100%);
}

.empty-state,
.empty-inner {
  padding: 32px;
  border-radius: 20px;
  background: #f8fbff;
  text-align: center;
  color: #6b7c96;
}

@media (max-width: 980px) {
  .summary-grid,
  .top-grid,
  .student-summary,
  .student-grid,
  .case-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .parent-page {
    padding: 14px;
  }

  .page-header,
  .header-actions,
  .student-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
