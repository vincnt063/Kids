import { defineStore } from 'pinia'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    currentCharacter: 'cat',

    characters: [
      { id: 'cat', name: '小猫', image: 'https://api.iconify.design/noto:cat.svg' },
      { id: 'dog', name: '小狗', image: 'https://api.iconify.design/noto:dog.svg' },
      { id: 'penguin', name: '企鹅', image: 'https://api.iconify.design/noto:penguin.svg' },
      { id: 'robot', name: '机器人', image: 'https://api.iconify.design/noto:robot.svg' }
    ],

    characterProps: {
      x: 50,
      y: 200,
      size: 100,
      direction: 0,
      visible: true
    },

    defaultProps: {
      x: 50,
      y: 200,
      size: 100,
      direction: 0,
      visible: true
    }
  }),

  getters: {
    getCurrentCharacter(state) {
      return state.characters.find(char => char.id === state.currentCharacter)
    },

    getCurrentImage() {
      return this.getCurrentCharacter?.image || this.characters[0]?.image
    }
  },

  actions: {
    setCharacter(characterId) {
      if (this.characters.some(character => character.id === characterId)) {
        this.currentCharacter = characterId
      }
    },

    syncRuntimeState(partialState = {}) {
      this.characterProps = {
        ...this.characterProps,
        ...partialState
      }
    },

    setStageStart(partialState = {}) {
      this.defaultProps = {
        ...this.defaultProps,
        ...partialState
      }

      this.characterProps = {
        ...this.defaultProps
      }
    },

    resetCharacter() {
      this.characterProps = {
        ...this.defaultProps
      }
    }
  }
})
