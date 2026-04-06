import { defineStore } from 'pinia'
import axios from 'axios'
import { useProgressStore } from '@/store/progress'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    isLoggedIn: !!localStorage.getItem('token')
  }),

  getters: {
    getUserId: (state) => state.userInfo.id,
    getUsername: (state) => state.userInfo.username,
    getUserRole: (state) => state.userInfo.role,
    getUserLevel: (state) => state.userInfo.level || 1,
    getUserPoints: (state) => state.userInfo.points || 0
  },

  actions: {
    hydrateFromStorage() {
      const token = localStorage.getItem('token') || ''
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

      this.token = token
      this.userInfo = userInfo
      this.isLoggedIn = !!token
    },

    setSession(token, user) {
      this.token = token || ''
      this.userInfo = user || {}
      this.isLoggedIn = !!token

      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return
      }

      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    async login(username, password) {
      try {
        const response = await axios.post('/api/user/login', {
          username,
          password
        })
        
        if (response.data.code === 200) {
          const { token, user } = response.data.data
          this.setSession(token, user)
          
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('登录失败:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || '登录失败，请稍后重试' 
        }
      }
    },

    async register(username, password, role = 'child') {
      try {
        const response = await axios.post('/api/user/register', {
          username,
          password,
          role
        })
        
        if (response.data.code === 200) {
          return { success: true }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error('注册失败:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || '注册失败，请稍后重试' 
        }
      }
    },

    async logout() {
      this.setSession('', {})
      const progressStore = useProgressStore()
      progressStore.loadLocalProgress()
    },

    async fetchUserInfo(userId) {
      try {
        const response = await axios.get('/api/user/info', {
          params: { userId }
        })
        
        if (response.data.code === 200) {
          this.userInfo = response.data.data
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }
  }
})
