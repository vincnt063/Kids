<template>
  <div class="path-page">
    <header class="path-header">
      <button type="button" class="back-button" @click="goHome">返回首页</button>
      <div class="header-copy">
        <span class="path-label">从简单到有创意，一步一步来</span>
        <h1>学习地图</h1>
        <p>先学角色怎么动，再学怎么拐弯和避开障碍，最后进入重复、判断、分支和等待，把路线写得更像程序。</p>
      </div>
      <div class="header-actions">
        <div v-if="isLoggedIn" class="user-pill">当前账号：{{ currentUsername }}</div>
        <el-button size="large" @click="goToAccount">
          {{ isLoggedIn ? '学习进度' : '家长登录' }}
        </el-button>
        <el-button type="primary" size="large" @click="goToLevels">去闯关</el-button>
        <el-button v-if="isLoggedIn" size="large" plain @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="path-main">
      <section class="stage-grid">
        <article v-for="stage in stages" :key="stage.name" class="stage-card">
          <div class="stage-index">{{ stage.index }}</div>
          <small>{{ stage.age }}</small>
          <h2>{{ stage.name }}</h2>
          <p>{{ stage.description }}</p>
          <div class="stage-tags">
            <span v-for="tag in stage.tags" :key="tag">{{ tag }}</span>
          </div>
        </article>
      </section>

      <section class="summary-card">
        <div class="summary-copy">
          <span class="path-label blue">闯关时你会看到</span>
          <h2>每次只学一点点，孩子更容易成功</h2>
          <p>实验室会告诉你本关要用哪些积木，还会自动保存进度。做错了也可以一键回到起点，继续试。</p>
        </div>

        <div class="summary-points">
          <article v-for="point in points" :key="point.title" class="point-card">
            <strong>{{ point.title }}</strong>
            <p>{{ point.description }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn || !!userStore.token)
const isParentAccount = computed(() => userStore.getUserRole === 'parent')
const currentUsername = computed(() => userStore.getUsername || '当前账号')

const stages = [
  {
    index: '01',
    age: '刚开始',
    name: '先让角色动起来',
    description: '认识前进、转向和顺序，让孩子知道积木会真的控制角色。',
    tags: ['前进', '转向', '顺序']
  },
  {
    index: '02',
    age: '熟悉以后',
    name: '学会找路线',
    description: '开始碰到星星、障碍和坐标，任务更像小游戏，也更需要观察。',
    tags: ['路线', '星星', '坐标']
  },
  {
    index: '03',
    age: '更进一步',
    name: '把步骤变聪明',
    description: '学会重复、条件判断、switch 分支和等待控制，把路线整理成更像真正程序的结构。',
    tags: ['重复', '判断分支', '等待控制']
  }
]

const points = [
  {
    title: '按钮更大',
    description: '开始、重来、保存这些主要动作更容易找到。'
  },
  {
    title: '提示更少更准',
    description: '每关只展示最需要的积木，不把孩子淹没在一大堆选择里。'
  },
  {
    title: '结果更明显',
    description: '成功、差一点、撞到障碍都会马上告诉孩子发生了什么。'
  }
]

const goHome = () => {
  router.push('/')
}

const goToLevels = () => {
  router.push('/levels')
}

const goToAccount = () => {
  router.push(isLoggedIn.value ? (isParentAccount.value ? '/parent-progress' : '/progress') : '/login')
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
.path-page {
  min-height: 100vh;
  padding: 24px;
  color: #21304a;
  background:
    radial-gradient(circle at top left, rgba(255, 207, 107, 0.24), transparent 24%),
    radial-gradient(circle at top right, rgba(92, 160, 246, 0.16), transparent 22%),
    linear-gradient(180deg, #fff9ee 0%, #eef6ff 100%);
}

.path-header,
.stage-card,
.summary-card,
.point-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(33, 48, 74, 0.1);
  box-shadow: 0 18px 34px rgba(33, 48, 74, 0.08);
}

.path-header {
  max-width: 1160px;
  margin: 0 auto 20px;
  padding: 26px 28px;
  border-radius: 30px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
}

.back-button {
  border: none;
  background: #fff2d6;
  color: #9a6410;
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.path-label {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 197, 90, 0.18);
  color: #9a6410;
  font-size: 12px;
  font-weight: 700;
}

.path-label.blue {
  background: rgba(74, 127, 200, 0.12);
  color: #315d98;
}

.header-copy h1 {
  margin: 14px 0 8px;
  font-size: clamp(34px, 4vw, 50px);
}

.header-copy p,
.stage-card p,
.point-card p,
.summary-copy p {
  margin: 0;
  line-height: 1.8;
  color: #66758d;
}

.path-main {
  max-width: 1160px;
  margin: 0 auto;
}

.stage-grid,
.summary-points {
  display: grid;
  gap: 16px;
}

.stage-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stage-card {
  padding: 22px;
  border-radius: 26px;
}

.stage-index {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: linear-gradient(135deg, #f39c6b 0%, #f3c551 100%);
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.stage-card small {
  display: inline-block;
  margin-top: 14px;
  color: #ea6d59;
  font-size: 12px;
  font-weight: 700;
}

.stage-card h2,
.summary-copy h2 {
  margin: 10px 0;
  font-size: 28px;
}

.stage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.stage-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #315d98;
  font-size: 12px;
  font-weight: 700;
}

.summary-card {
  margin-top: 18px;
  padding: 24px;
  border-radius: 30px;
}

.summary-points {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

.point-card {
  padding: 18px;
  border-radius: 20px;
}

.point-card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 22px;
}

@media (max-width: 960px) {
  .path-header,
  .stage-grid,
  .summary-points {
    grid-template-columns: 1fr;
  }

  .path-header {
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .user-pill {
    justify-content: center;
  }
}

@media (max-width: 720px) {
  .path-page {
    padding: 14px;
  }
}
</style>
