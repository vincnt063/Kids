import { defineStore } from 'pinia'
import axios from 'axios'

const cloneCase = (item = {}) => JSON.parse(JSON.stringify(item))
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
const normalizeStringList = (items) => {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

const EMPTY_CASE = Object.freeze({
  id: 1,
  title: '',
  shortTitle: '',
  description: '',
  goal: '',
  tip: '',
  helperText: '',
  taskSteps: [],
  availableBlocks: [],
  focusBlocks: [],
  difficulty: 'easy',
  difficultyLabel: '',
  minStars: 1,
  coverEmoji: '',
  knowledgePoints: [],
  character: 'cat',
  backgroundId: 'school',
  stage: {
    start: { x: 8, y: 44, direction: 3 },
    target: null,
    stars: [],
    obstacles: [],
    guidePoints: []
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 9
  },
  initialWorkspace: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"></block></xml>',
  sortOrder: 1,
  status: 1
})

const parseBackendCase = (item = {}) => {
  const caseId = Number(item.id)
  if (!Number.isInteger(caseId) || caseId <= 0) {
    return null
  }

  const stage = isPlainObject(item.stage) ? cloneCase(item.stage) : {}
  const evaluation = isPlainObject(item.evaluation) ? cloneCase(item.evaluation) : {}

  return {
    ...cloneCase(EMPTY_CASE),
    ...cloneCase(item),
    id: caseId,
    title: item.title || '',
    shortTitle: item.shortTitle || item.title || '',
    description: item.description || '',
    goal: item.goal || item.targetDescription || '',
    tip: item.tip || item.hint || '',
    helperText: item.helperText || item.hint || '',
    taskSteps: normalizeStringList(item.taskSteps),
    availableBlocks: normalizeStringList(item.availableBlocks),
    focusBlocks: normalizeStringList(item.focusBlocks),
    difficulty: item.difficulty || EMPTY_CASE.difficulty,
    difficultyLabel: item.difficultyLabel || '',
    minStars: Number(item.minStars) || EMPTY_CASE.minStars,
    coverEmoji: item.coverEmoji || '',
    knowledgePoints: normalizeStringList(item.knowledgePoints),
    character: item.character || EMPTY_CASE.character,
    backgroundId: item.backgroundId || EMPTY_CASE.backgroundId,
    stage: {
      ...cloneCase(EMPTY_CASE.stage),
      ...stage,
      start: {
        ...cloneCase(EMPTY_CASE.stage.start),
        ...(isPlainObject(stage.start) ? stage.start : {})
      },
      target: isPlainObject(stage.target) ? stage.target : stage.target ?? null,
      stars: Array.isArray(stage.stars) ? stage.stars : [],
      obstacles: Array.isArray(stage.obstacles) ? stage.obstacles : [],
      guidePoints: Array.isArray(stage.guidePoints) ? stage.guidePoints : []
    },
    evaluation: {
      ...cloneCase(EMPTY_CASE.evaluation),
      ...evaluation
    },
    initialWorkspace: item.initialWorkspace || EMPTY_CASE.initialWorkspace,
    sortOrder: Number(item.sortOrder) || caseId,
    status: Number(item.status ?? 1)
  }
}

export const useCaseStore = defineStore('case', {
  state: () => ({
    cases: [],
    previewCases: {},
    currentCaseId: EMPTY_CASE.id,
    loading: false,
    loadedFromBackend: false
  }),

  getters: {
    currentCase(state) {
      const previewCase = state.previewCases[String(state.currentCaseId)]
      return previewCase || state.cases.find(item => item.id === state.currentCaseId) || state.cases[0] || Object.values(state.previewCases)[0] || cloneCase(EMPTY_CASE)
    },

    getCaseById: (state) => (caseId) => {
      const normalizedId = Number(caseId)
      return state.previewCases[String(normalizedId)] || state.cases.find((item) => item.id === normalizedId) || state.cases[0] || Object.values(state.previewCases)[0] || cloneCase(EMPTY_CASE)
    },

    getCasesByDifficulty: (state) => (difficulty) => {
      return state.cases.filter(item => item.difficulty === difficulty)
    },

    getCasesForLab(state) {
      const mergedMap = {}

      state.cases.forEach((item) => {
        mergedMap[String(item.id)] = item
      })

      Object.values(state.previewCases).forEach((item) => {
        mergedMap[String(item.id)] = item
      })

      return Object.values(mergedMap).sort((left, right) => {
        const leftOrder = Number(left.sortOrder ?? left.id)
        const rightOrder = Number(right.sortOrder ?? right.id)
        return leftOrder - rightOrder || left.id - right.id
      })
    }
  },

  actions: {
    initializeCases(options = {}) {
      const { preservePreview = false } = options
      this.cases = []
      this.previewCases = preservePreview ? this.previewCases : {}
      this.currentCaseId = EMPTY_CASE.id
      this.loadedFromBackend = false
    },

    async fetchCases(force = false) {
      if (this.loading || (this.loadedFromBackend && !force)) {
        return this.cases
      }

      this.loading = true

      try {
        const response = await axios.get('/api/case/list')
        const backendCases = Array.isArray(response.data?.data) ? response.data.data : []
        const mergedCases = backendCases
          .map((item) => parseBackendCase(item))
          .filter(Boolean)
          .sort((left, right) => {
            const leftOrder = Number(left.sortOrder ?? left.id)
            const rightOrder = Number(right.sortOrder ?? right.id)
            return leftOrder - rightOrder || left.id - right.id
          })

        if (mergedCases.length) {
          this.cases = mergedCases
          this.currentCaseId = this.getCaseById(this.currentCaseId)?.id || mergedCases[0].id
        }
        this.loadedFromBackend = true
      } catch (error) {
        console.error('获取关卡列表失败:', error)
        this.cases = []
      } finally {
        this.loading = false
      }

      return this.cases
    },

    setCurrentCase(caseId) {
      this.currentCaseId = this.getCaseById(caseId)?.id || this.cases[0]?.id || EMPTY_CASE.id
    },

    setPreviewCase(caseData) {
      const previewCase = parseBackendCase(caseData)
      if (!previewCase) {
        return null
      }

      this.previewCases = {
        ...this.previewCases,
        [String(previewCase.id)]: previewCase
      }

      return previewCase
    },

    clearPreviewCase(caseId) {
      const nextPreviewCases = { ...this.previewCases }
      delete nextPreviewCases[String(caseId)]
      this.previewCases = nextPreviewCases
    }
  }
})
