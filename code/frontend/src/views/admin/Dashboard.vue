<template>
  <div class="dashboard-page">
    <aside class="sidebar">
      <router-link to="/" class="brand">
        <div class="brand-mark">K</div>
        <div class="brand-copy">
          <strong>Kids Programming Lab</strong>
          <span>后台数据</span>
        </div>
      </router-link>

      <nav class="menu-list">
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          class="menu-item"
          :class="{ active: activeMenu === item.id }"
          @click="activeMenu = item.id"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <p class="sidebar-note">保留基础管理和数据查看，适合毕设答辩演示。</p>
    </aside>

    <main v-loading="loading" class="dashboard-main">
      <header class="topbar">
        <div>
          <span class="eyebrow">管理后台</span>
          <h1>{{ pageMeta.title }}</h1>
          <p>{{ pageMeta.description }}</p>
        </div>

        <el-dropdown>
          <span class="user-entry">
            <el-avatar :size="36">{{ currentUserInitial }}</el-avatar>
            <span>{{ currentUsername }}</span>
          </span>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人设置</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <section v-if="activeMenu === 'dashboard'" class="dashboard-section">
        <div class="stats-grid">
          <article
            v-for="item in statCards"
            :key="item.key"
            class="stat-card"
            :class="item.tone"
          >
            <div class="stat-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div>
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </article>
        </div>

        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3>最近活动</h3>
                <p>来自数据库中的最近学习记录。</p>
              </div>
            </div>
          </template>

          <el-table :data="recentActivities" stripe>
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="user" label="用户" width="120" />
            <el-table-column prop="action" label="操作" />
          </el-table>
        </el-card>
      </section>

      <section v-else-if="activeMenu === 'users'" class="dashboard-section">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3>用户管理</h3>
                <p>查看学生和管理员账号。</p>
              </div>
              <el-button type="primary" @click="addUser">新增用户</el-button>
            </div>
          </template>

          <el-table :data="users" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="getRoleTagType(row.role)">
                  {{ getRoleText(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="points" label="积分" width="100" />
            <el-table-column prop="level" label="等级" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '正常' : '冻结' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="editUser(row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="deleteUser(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </section>

      <section v-else-if="activeMenu === 'modules'" class="dashboard-section">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3>模块管理</h3>
                <p>查看积木模块和状态。</p>
              </div>
              <el-button type="primary" @click="addModule">新增模块</el-button>
            </div>
          </template>

          <el-table :data="modules" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="模块名称" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag>{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="color" label="颜色" width="100">
              <template #default="{ row }">
                <div class="color-swatch" :style="{ background: row.color }"></div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="editModule(row)">编辑</el-button>
                <el-button size="small" type="danger" plain @click="deleteModule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </section>

      <section v-else-if="activeMenu === 'cases'" class="dashboard-section">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3>案例管理</h3>
                <p>查看关卡难度、角色和上架状态。</p>
              </div>
              <el-button type="primary" @click="addCase">新增案例</el-button>
            </div>
          </template>

          <el-table :data="cases" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="案例标题" />
            <el-table-column prop="difficulty" label="难度" width="100">
              <template #default="{ row }">
                <el-tag :type="getDifficultyType(row.difficulty)">
                  {{ getDifficultyText(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="character" label="角色" width="120">
              <template #default="{ row }">
                <span>{{ getCaseCharacterText(row.character) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '上架' : '在库中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button size="small" @click="editCase(row)">编辑</el-button>
                <el-button size="small" plain @click="previewCase(row)">预览</el-button>
                <el-button size="small" type="danger" plain @click="deleteCase(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </section>

      <section v-else-if="activeMenu === 'records'" class="dashboard-section">
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <div>
                <h3>学习记录</h3>
                <p>查看作品、用时和获得的星级。</p>
              </div>
            </div>
          </template>

          <el-table :data="records" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="userName" label="用户名" width="120" />
            <el-table-column prop="workName" label="作品名称" />
            <el-table-column prop="duration" label="耗时（秒）" width="110" />
            <el-table-column prop="stars" label="星级" width="100">
              <template #default="{ row }">
                <span>{{ '★'.repeat(row.stars) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="viewRecord(row)">查看</el-button>
                <el-button size="small" type="danger" plain @click="deleteRecord(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </section>

      <el-dialog
        v-model="userDialogVisible"
        title="编辑用户状态"
        width="420px"
        destroy-on-close
      >
        <el-form label-width="88px" class="user-dialog-form">
          <el-form-item label="用户名">
            <el-input :model-value="userForm.username" disabled />
          </el-form-item>
          <el-form-item label="角色">
            <el-input :model-value="getRoleText(userForm.role)" disabled />
          </el-form-item>
          <el-form-item label="账号状态">
            <el-select v-model="userForm.status" class="full-width">
              <el-option
                v-for="item in userStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeUserDialog">取消</el-button>
            <el-button type="primary" :loading="userDialogSaving" @click="saveUserStatus">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="moduleDialogVisible"
        title="编辑模块"
        width="460px"
        destroy-on-close
      >
        <el-form label-width="88px" class="module-dialog-form">
          <el-form-item label="模块名称">
            <el-input :model-value="moduleForm.name" disabled />
          </el-form-item>
          <el-form-item label="模块类型">
            <el-input :model-value="moduleForm.type" disabled />
          </el-form-item>
          <el-form-item label="模块颜色">
            <div class="module-color-editor">
              <input
                type="color"
                class="module-color-input"
                :value="modulePickerColor"
                @input="syncModuleColorFromPicker"
              />
              <div class="module-color-fields">
                <div class="color-swatch color-swatch-large" :style="{ background: modulePickerColor }"></div>
                <el-input
                  v-model="moduleForm.color"
                  class="full-width"
                  placeholder="例如：#4A7FC8"
                  maxlength="7"
                  @blur="moduleForm.color = normalizeModuleColor(moduleForm.color)"
                />
              </div>
            </div>
            <div class="field-hint">支持 6 位十六进制颜色，例如 #4A7FC8。</div>
          </el-form-item>
          <el-form-item label="模块状态">
            <el-select v-model="moduleForm.status" class="full-width">
              <el-option
                v-for="item in moduleStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeModuleDialog">取消</el-button>
            <el-button type="primary" :loading="moduleDialogSaving" @click="saveModule">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="caseDialogVisible"
        title="编辑案例"
        width="460px"
        destroy-on-close
      >
        <el-form label-width="88px" class="case-dialog-form">
          <el-form-item label="案例标题">
            <el-input :model-value="caseForm.title" disabled />
          </el-form-item>
          <el-form-item label="难度">
            <el-input :model-value="getDifficultyText(caseForm.difficulty)" disabled />
          </el-form-item>
          <el-form-item label="初始角色">
            <el-select v-model="caseForm.character" class="full-width">
              <el-option
                v-for="item in caseCharacterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="案例状态">
            <el-select v-model="caseForm.status" class="full-width">
              <el-option
                v-for="item in caseStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeCaseDialog">取消</el-button>
            <el-button type="primary" :loading="caseDialogSaving" @click="saveCase">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataBoard, Document, Grid, Notebook, User } from '@element-plus/icons-vue'
import { useCaseStore } from '@/store/case'
import { useUserStore } from '@/store/user'

const router = useRouter()
const caseStore = useCaseStore()
const userStore = useUserStore()
const activeMenu = ref('dashboard')
const currentUsername = computed(() => userStore.getUsername || '管理员')
const currentUserInitial = computed(() => currentUsername.value.slice(0, 1).toUpperCase())

const menuItems = [
  { id: 'dashboard', label: '控制台', icon: DataBoard },
  { id: 'users', label: '用户管理', icon: User },
  { id: 'modules', label: '模块管理', icon: Grid },
  { id: 'cases', label: '案例管理', icon: Document },
  { id: 'records', label: '学习记录', icon: Notebook }
]

const pageMap = {
  dashboard: {
    title: '控制台',
    description: '查看当前站点的核心数据和最近活动。'
  },
  users: {
    title: '用户管理',
    description: '查看系统中的学生和管理员账号。'
  },
  modules: {
    title: '模块管理',
    description: '管理积木模块和可用状态。'
  },
  cases: {
    title: '案例管理',
    description: '查看轻量教学关卡和难度信息。'
  },
  records: {
    title: '学习记录',
    description: '查看作品保存记录和完成情况。'
  }
}

const pageMeta = computed(() => pageMap[activeMenu.value])

const loading = ref(false)
const stats = ref({
  userCount: 0,
  caseCount: 0,
  moduleCount: 0,
  recordCount: 0
})

const statCards = computed(() => [
  {
    key: 'userCount',
    label: '总用户数',
    value: stats.value.userCount,
    icon: User,
    tone: 'blue'
  },
  {
    key: 'caseCount',
    label: '关卡总数',
    value: stats.value.caseCount,
    icon: Document,
    tone: 'gold'
  },
  {
    key: 'moduleCount',
    label: '模块总数',
    value: stats.value.moduleCount,
    icon: Grid,
    tone: 'teal'
  },
  {
    key: 'recordCount',
    label: '作品总数',
    value: stats.value.recordCount,
    icon: Notebook,
    tone: 'rose'
  }
])

const recentActivities = ref([])
const users = ref([])
const modules = ref([])
const cases = ref([])
const records = ref([])
const userDialogVisible = ref(false)
const userDialogSaving = ref(false)
const moduleDialogVisible = ref(false)
const moduleDialogSaving = ref(false)
const caseDialogVisible = ref(false)
const caseDialogSaving = ref(false)
const userForm = reactive({
  id: null,
  username: '',
  role: '',
  status: 1
})
const defaultModuleColor = '#4A7FC8'
const moduleForm = reactive({
  id: null,
  name: '',
  type: '',
  color: defaultModuleColor,
  status: 1
})
const caseForm = reactive({
  id: null,
  title: '',
  difficulty: '',
  character: 'cat',
  status: 1
})
const userStatusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '冻结' }
]
const moduleStatusOptions = [
  { value: 1, label: '启用' },
  { value: 0, label: '禁用' }
]
const caseCharacterOptions = [
  { value: 'cat', label: '小猫' },
  { value: 'dog', label: '小狗' },
  { value: 'penguin', label: '企鹅' },
  { value: 'robot', label: '机器人' }
]
const caseStatusOptions = [
  { value: 1, label: '上架' },
  { value: 0, label: '在库中' }
]
const modulePickerColor = computed(() => (
  isValidHexColor(moduleForm.color) ? normalizeModuleColor(moduleForm.color) : defaultModuleColor
))

onMounted(() => {
  loadDashboardData()
})

const loadDashboardData = async () => {
  loading.value = true

  try {
    const response = await axios.get('/api/stats/dashboard')
    if (response.data?.code !== 200 || !response.data?.data) {
      ElMessage.error(response.data?.message || '获取后台数据失败')
      return
    }

    const data = response.data.data
    stats.value = {
      userCount: data.stats?.userCount || 0,
      caseCount: data.stats?.caseCount || 0,
      moduleCount: data.stats?.moduleCount || 0,
      recordCount: data.stats?.recordCount || 0
    }
    recentActivities.value = data.recentActivities || []
    users.value = data.users || []
    modules.value = data.modules || []
    cases.value = data.cases || []
    records.value = data.records || []
  } catch (error) {
    console.error('获取后台数据失败:', error)
    ElMessage.error('获取后台数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getRoleTagType = (role) => {
  const types = {
    admin: 'danger',
    parent: 'warning',
    child: 'primary'
  }

  return types[role] || 'info'
}

const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    parent: '家长',
    child: '学生'
  }

  return texts[role] || role
}

const getDifficultyType = (difficulty) => {
  const types = { easy: 'success', medium: 'warning', hard: 'danger' }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = { easy: '简单', medium: '中等', hard: '困难' }
  return texts[difficulty] || difficulty
}

const getCaseCharacterText = (character) => {
  return caseCharacterOptions.find((item) => item.value === character)?.label || character
}

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test((value || '').trim())

const normalizeModuleColor = (value) => (value || '').trim().toUpperCase()

const resetUserForm = () => {
  userForm.id = null
  userForm.username = ''
  userForm.role = ''
  userForm.status = 1
}

const closeUserDialog = () => {
  userDialogVisible.value = false
  resetUserForm()
}

const resetModuleForm = () => {
  moduleForm.id = null
  moduleForm.name = ''
  moduleForm.type = ''
  moduleForm.color = defaultModuleColor
  moduleForm.status = 1
}

const closeModuleDialog = () => {
  moduleDialogVisible.value = false
  resetModuleForm()
}

const resetCaseForm = () => {
  caseForm.id = null
  caseForm.title = ''
  caseForm.difficulty = ''
  caseForm.character = 'cat'
  caseForm.status = 1
}

const closeCaseDialog = () => {
  caseDialogVisible.value = false
  resetCaseForm()
}

const syncModuleColorFromPicker = (event) => {
  moduleForm.color = normalizeModuleColor(event.target.value)
}

const addUser = () => ElMessage.info('新增用户功能待实现')
const editUser = (row) => {
  userForm.id = row.id
  userForm.username = row.username
  userForm.role = row.role
  userForm.status = row.status === 0 ? 0 : 1
  userDialogVisible.value = true
}

const saveUserStatus = async () => {
  if (!userForm.id) {
    ElMessage.error('缺少用户信息，无法保存')
    return
  }

  userDialogSaving.value = true

  try {
    const response = await axios.put(`/api/user/${userForm.id}/status`, {
      status: userForm.status
    })

    if (response.data?.code !== 200) {
      ElMessage.error(response.data?.message || '更新用户状态失败')
      return
    }

    users.value = users.value.map((item) => {
      if (item.id !== userForm.id) {
        return item
      }

      return {
        ...item,
        status: userForm.status
      }
    })

    const actionText = userForm.status === 1 ? '恢复正常' : '冻结'
    const username = userForm.username
    closeUserDialog()
    ElMessage.success(`已${actionText}用户 ${username}`)
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error(error.response?.data?.message || '更新用户状态失败，请稍后重试')
  } finally {
    userDialogSaving.value = false
  }
}

const deleteUser = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const addModule = () => ElMessage.info('新增模块功能待实现')
const editModule = (row) => {
  moduleForm.id = row.id
  moduleForm.name = row.name
  moduleForm.type = row.type
  moduleForm.color = normalizeModuleColor(row.color || defaultModuleColor)
  moduleForm.status = row.status === 0 ? 0 : 1
  moduleDialogVisible.value = true
}

const saveModule = async () => {
  if (!moduleForm.id) {
    ElMessage.error('缺少模块信息，无法保存')
    return
  }

  const normalizedColor = normalizeModuleColor(moduleForm.color)
  if (!isValidHexColor(normalizedColor)) {
    ElMessage.error('请输入正确的 6 位十六进制颜色值，例如 #4A7FC8')
    return
  }

  moduleDialogSaving.value = true

  try {
    const response = await axios.put(`/api/module/${moduleForm.id}`, {
      color: normalizedColor,
      status: moduleForm.status
    })

    if (response.data?.code !== 200) {
      ElMessage.error(response.data?.message || '更新模块失败')
      return
    }

    modules.value = modules.value.map((item) => {
      if (item.id !== moduleForm.id) {
        return item
      }

      return {
        ...item,
        color: normalizedColor,
        status: moduleForm.status
      }
    })

    const moduleName = moduleForm.name
    closeModuleDialog()
    ElMessage.success(`已更新模块 ${moduleName}`)
  } catch (error) {
    console.error('更新模块失败:', error)
    ElMessage.error(error.response?.data?.message || '更新模块失败，请稍后重试')
  } finally {
    moduleDialogSaving.value = false
  }
}

const deleteModule = (row) => {
  ElMessageBox.confirm('确定要删除该模块吗？', '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const addCase = () => ElMessage.info('新增案例功能待实现')
const editCase = (row) => {
  caseForm.id = row.id
  caseForm.title = row.title
  caseForm.difficulty = row.difficulty
  caseForm.character = row.character || 'cat'
  caseForm.status = row.status === 0 ? 0 : 1
  caseDialogVisible.value = true
}

const saveCase = async () => {
  if (!caseForm.id) {
    ElMessage.error('缺少案例信息，无法保存')
    return
  }

  if (!caseForm.character) {
    ElMessage.error('请选择案例初始角色')
    return
  }

  caseDialogSaving.value = true

  try {
    const response = await axios.put(`/api/case/${caseForm.id}`, {
      character: caseForm.character,
      status: caseForm.status
    })

    if (response.data?.code !== 200) {
      ElMessage.error(response.data?.message || '更新案例失败')
      return
    }

    const updatedCase = {
      ...response.data.data,
      id: caseForm.id,
      title: caseForm.title,
      difficulty: caseForm.difficulty,
      character: caseForm.character,
      status: caseForm.status
    }

    cases.value = cases.value.map((item) => {
      if (item.id !== caseForm.id) {
        return item
      }

      return {
        ...item,
        character: caseForm.character,
        status: caseForm.status
      }
    })

    caseStore.setPreviewCase(updatedCase)

    const caseTitle = caseForm.title
    closeCaseDialog()
    ElMessage.success(`已更新案例 ${caseTitle}`)
  } catch (error) {
    console.error('更新案例失败:', error)
    ElMessage.error(error.response?.data?.message || '更新案例失败，请稍后重试')
  } finally {
    caseDialogSaving.value = false
  }
}

const previewCase = (row) => {
  caseStore.setPreviewCase(row)
  router.push({
    path: '/lab',
    query: {
      caseId: row.id,
      adminPreview: '1'
    }
  })
}
const deleteCase = (row) => {
  ElMessageBox.confirm('确定要删除该案例吗？', '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const viewRecord = (row) => ElMessage.info(`查看作品：${row.workName}`)
const deleteRecord = (row) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const logout = () => {
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
.dashboard-page {
  min-height: 100vh;
  padding: 20px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  background:
    radial-gradient(circle at top right, rgba(255, 205, 118, 0.14), transparent 24%),
    radial-gradient(circle at bottom left, rgba(106, 167, 255, 0.14), transparent 24%),
    var(--app-bg);
}

.sidebar,
.topbar,
.section-card,
.stat-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--app-line);
  box-shadow: var(--app-shadow);
}

.sidebar {
  padding: 18px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ff8f5a, #ffbe55);
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.brand-copy {
  display: flex;
  flex-direction: column;
}

.brand-copy strong {
  color: var(--app-text);
}

.brand-copy span,
.sidebar-note {
  color: var(--app-text-soft);
  font-size: 13px;
  line-height: 1.7;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #516179;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font: inherit;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover,
.menu-item.active {
  background: #f5f7fb;
  color: var(--app-text);
}

.dashboard-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  padding: 20px 24px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--app-warm);
  color: #99601a;
  font-size: 12px;
}

.topbar h1 {
  margin: 12px 0 6px;
  font-size: 30px;
}

.topbar p {
  margin: 0;
  color: var(--app-text-soft);
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--app-text);
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.stat-card strong {
  display: block;
  font-size: 28px;
  line-height: 1;
}

.stat-card span {
  display: block;
  margin-top: 8px;
  color: var(--app-text-soft);
  font-size: 13px;
}

.stat-card.blue .stat-icon {
  background: rgba(74, 127, 200, 0.14);
  color: #4a7fc8;
}

.stat-card.gold .stat-icon {
  background: rgba(255, 183, 76, 0.18);
  color: #b87a10;
}

.stat-card.teal .stat-icon {
  background: rgba(84, 180, 160, 0.16);
  color: #2f8d7d;
}

.stat-card.rose .stat-icon {
  background: rgba(239, 120, 129, 0.16);
  color: #c1555f;
}

.section-card {
  border-radius: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
}

.section-header p {
  margin: 6px 0 0;
  color: var(--app-text-soft);
  font-size: 13px;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.module-color-editor {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.module-color-input {
  width: 48px;
  height: 48px;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  padding: 4px;
  background: white;
  cursor: pointer;
}

.module-color-fields {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-swatch-large {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  flex-shrink: 0;
}

.field-hint {
  margin-top: 8px;
  color: var(--app-text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.color-swatch {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(35, 50, 76, 0.08);
}

@media (max-width: 1180px) {
  .dashboard-page {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .dashboard-page {
    padding: 14px;
  }

  .topbar,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
