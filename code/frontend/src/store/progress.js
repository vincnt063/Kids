import { defineStore } from 'pinia'
import axios from 'axios'

const GUEST_CASE_PROGRESS_KEY = 'kids-programming-case-progress:guest'

const createEmptyProgress = (userId = null) => ({
  userId,
  totalCases: 0,
  totalTime: 0,
  totalWorks: 0,
  currentLevel: 1,
  totalPoints: 0,
  lastLoginTime: null
})

const normalizeStorageUserId = (userId = null) => {
  const normalizedUserId = Number(userId)
  return Number.isInteger(normalizedUserId) && normalizedUserId > 0 ? normalizedUserId : null
}

const resolveProgressStorageKey = (userId = null) => {
  const normalizedUserId = normalizeStorageUserId(userId)
  return normalizedUserId ? null : GUEST_CASE_PROGRESS_KEY
}

const readLocalProgress = (userId = null) => {
  try {
    const storageKey = resolveProgressStorageKey(userId)
    return storageKey ? JSON.parse(localStorage.getItem(storageKey) || '{}') : {}
  } catch (error) {
    console.error('读取本地关卡进度失败:', error)
    return {}
  }
}

const normalizeCaseProgress = (items = []) => {
  return items.reduce((result, item) => {
    const caseId = Number(item?.caseId)
    if (!caseId) {
      return result
    }

    result[caseId] = {
      completed: item?.completed !== false,
      stars: Math.max(0, Number(item?.stars) || 0),
      title: item?.title || `第 ${caseId} 关`,
      completedAt: item?.completedAt || Date.now()
    }
    return result
  }, {})
}
export const useProgressStore = defineStore('progress', {
  state: () => ({
    progress: createEmptyProgress(),
    caseProgress: readLocalProgress(),
    loading: false,
    activeUserId: null
  }),

  getters: {
    getTotalCases: (state) => state.progress?.totalCases || Object.keys(state.caseProgress).length,
    getTotalTime: (state) => state.progress?.totalTime || 0,
    getTotalWorks: (state) => state.progress?.totalWorks || 0,
    getCurrentLevel: (state) => state.progress?.currentLevel || 1,
    getTotalPoints: (state) => state.progress?.totalPoints || 0,

    getCompletedCaseCount: (state) => {
      return Object.values(state.caseProgress).filter(item => item.completed).length
    },

    getCaseProgress: (state) => (caseId) => {
      return state.caseProgress[caseId] || {
        completed: false,
        stars: 0
      }
    },

    isCaseCompleted: (state) => (caseId) => {
      return !!state.caseProgress[caseId]?.completed
    },

    isCaseUnlocked: (state) => (caseId) => {
      const numericId = Number(caseId)
      if (numericId <= 1) {
        return true
      }

      return !!state.caseProgress[numericId - 1]?.completed
    },
  },

  actions: {
    persistLocalProgress(userId = this.activeUserId) {
      const storageKey = resolveProgressStorageKey(userId)
      if (!storageKey) {
        return
      }

      localStorage.setItem(storageKey, JSON.stringify(this.caseProgress))
    },

    loadLocalProgress(userId = null) {
      const normalizedUserId = normalizeStorageUserId(userId)
      this.activeUserId = normalizedUserId
      this.progress = createEmptyProgress(normalizedUserId)
      this.caseProgress = normalizedUserId ? {} : readLocalProgress()
    },

    resetProgress(userId = null) {
      const normalizedUserId = normalizeStorageUserId(userId)
      this.activeUserId = normalizedUserId
      this.progress = createEmptyProgress(normalizedUserId)
      this.caseProgress = {}
      this.persistLocalProgress(normalizedUserId)
    },

    markCaseCompleted(caseInfo, stars) {
      const caseId = Number(caseInfo.id)
      const previous = this.caseProgress[caseId] || {
        completed: false,
        stars: 0
      }

      const nextStars = Math.max(previous.stars || 0, stars)
      const firstCompletion = !previous.completed

      this.caseProgress = {
        ...this.caseProgress,
        [caseId]: {
          completed: true,
          stars: nextStars,
          title: caseInfo.shortTitle || caseInfo.title,
          completedAt: previous.completedAt || Date.now()
        }
      }

      this.persistLocalProgress()

      return {
        firstCompletion,
        starsImproved: nextStars > (previous.stars || 0),
        stars: nextStars
      }
    },

    async fetchProgress(userId) {
      const normalizedUserId = normalizeStorageUserId(userId)

      if (!normalizedUserId) {
        this.loadLocalProgress()
        return
      }

      this.loading = true
      this.activeUserId = normalizedUserId

      try {
        const [summaryResult, caseResult] = await Promise.allSettled([
          axios.get(`/api/progress/user/${normalizedUserId}`),
          axios.get(`/api/progress/user/${normalizedUserId}/cases`)
        ])

        const progress =
          summaryResult.status === 'fulfilled' && summaryResult.value?.data?.code === 200
            ? { ...createEmptyProgress(normalizedUserId), ...summaryResult.value.data.data }
            : createEmptyProgress(normalizedUserId)

        let caseProgress =
          caseResult.status === 'fulfilled' && caseResult.value?.data?.code === 200
            ? normalizeCaseProgress(caseResult.value.data.data)
            : {}

        this.progress = progress
        this.caseProgress = caseProgress
      } catch (error) {
        console.error('获取进度失败:', error)
        this.progress = createEmptyProgress(normalizedUserId)
        this.caseProgress = {}
      } finally {
        this.loading = false
      }
    },

    async syncCompletionToBackend(userId, caseId, stars) {
      if (!userId) {
        return
      }

      try {
        await axios.post('/api/progress/update', {
          userId,
          caseId,
          stars
        })

        await this.fetchProgress(userId)
      } catch (error) {
        console.error('同步学习进度失败:', error)
      }
    }
  }
})
