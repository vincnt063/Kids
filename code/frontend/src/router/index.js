import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/path',
    name: 'LearningPath',
    component: () => import('@/views/LearningPath.vue')
  },
  {
    path: '/levels',
    name: 'Levels',
    component: () => import('@/views/Levels.vue')
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/Progress.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/parent-progress',
    name: 'ParentProgress',
    component: () => import('@/views/ParentProgress.vue'),
    meta: {
      requiresAuth: true,
      requiresParent: true
    }
  },
  {
    path: '/lab',
    name: 'ProgrammingLab',
    component: () => import('@/views/ProgrammingLab.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const getDefaultPath = (role) => {
  if (role === 'admin') {
    return '/admin'
  }

  if (role === 'parent') {
    return '/parent-progress'
  }

  return '/levels'
}

router.beforeEach((to) => {
  const userStore = useUserStore()
  userStore.hydrateFromStorage()

  const token = localStorage.getItem('token')

  let userInfo = {}
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  } catch (error) {
    userInfo = {}
  }

  if (to.meta.requiresAuth && !token) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if ((to.path === '/login' || to.path === '/register') && token) {
    return getDefaultPath(userInfo.role)
  }

  if (to.meta.requiresAdmin && userInfo.role !== 'admin') {
    return token ? getDefaultPath(userInfo.role) : '/login'
  }

  if (to.meta.requiresParent && userInfo.role !== 'parent') {
    return token ? getDefaultPath(userInfo.role) : '/login'
  }

  return true
})

export default router
