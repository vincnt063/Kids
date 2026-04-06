import { defineStore } from 'pinia'

export const useBackgroundStore = defineStore('background', {
  state: () => ({
    currentBackground: 'default',

    backgrounds: [
      {
        id: 'default',
        name: '默认',
        emoji: '🎨',
        color: 'linear-gradient(to bottom, #87ceeb 0%, #e0f6ff 50%, #90ee90 100%)'
      },
      {
        id: 'forest',
        name: '森林',
        emoji: '🌲',
        color: 'linear-gradient(to bottom, #134e5e 0%, #71b280 100%)'
      },
      {
        id: 'school',
        name: '学校',
        emoji: '🏫',
        color: 'linear-gradient(to bottom, #fff1eb 0%, #ace0f9 100%)'
      },
      {
        id: 'space',
        name: '太空',
        emoji: '🚀',
        color: 'linear-gradient(to bottom, #000000 0%, #434343 50%, #000000 100%)'
      },
      {
        id: 'rainbow',
        name: '彩虹',
        emoji: '🌈',
        color: 'linear-gradient(to bottom, #ff512f 0%, #dd2476 50%, #ff512f 100%)'
      }
    ]
  }),

  getters: {
    getCurrentBackground(state) {
      return state.backgrounds.find(bg => bg.id === state.currentBackground)
    }
  },

  actions: {
    setBackground(backgroundId) {
      const background = this.backgrounds.find(bg => bg.id === backgroundId)
      if (background) {
        this.currentBackground = backgroundId
      }
    }
  }
})
