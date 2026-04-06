import { defineStore } from 'pinia'
import axios from 'axios'

const createEmptyOverview = () => ({
  userCount: 0,
  caseCount: 0,
  activeCaseCount: 0,
  moduleCount: 0,
  activeModuleCount: 0,
  recordCount: 0,
  characterCount: 0,
  totalStarsEarned: 0,
  completedUserCount: 0
})

export const useSiteStore = defineStore('site', {
  state: () => ({
    overview: createEmptyOverview(),
    loading: false,
    loaded: false
  }),

  getters: {
    getActiveCaseCount: (state) => state.overview.activeCaseCount || 0,
    getCaseCount: (state) => state.overview.caseCount || 0,
    getUserCount: (state) => state.overview.userCount || 0,
    getModuleCount: (state) => state.overview.moduleCount || 0,
    getRecordCount: (state) => state.overview.recordCount || 0,
    getCharacterCount: (state) => state.overview.characterCount || 0
  },

  actions: {
    async fetchOverview(force = false) {
      if (this.loading || (this.loaded && !force)) {
        return this.overview
      }

      this.loading = true

      try {
        const response = await axios.get('/api/stats/overview')
        if (response.data?.code === 200 && response.data.data) {
          this.overview = {
            ...createEmptyOverview(),
            ...response.data.data
          }
          this.loaded = true
        }
      } catch (error) {
        console.error('获取站点统计失败:', error)
      } finally {
        this.loading = false
      }

      return this.overview
    }
  }
})
