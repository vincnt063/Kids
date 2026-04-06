<template>
  <div class="lab-page">
    <header class="lab-header">
      <div class="header-main">
        <el-button class="back-button" size="large" @click="goToLevels">返回关卡</el-button>
        <div class="title-group">
          <span class="difficulty-pill">{{ activeCase.difficultyLabel }}</span>
          <div>
            <h1>{{ activeCase.shortTitle }}</h1>
            <p>{{ activeCase.description }}</p>
          </div>
        </div>
      </div>

      <div class="header-meta">
        <article class="meta-card">
          <span>当前状态</span>
          <strong>{{ progressStore.isCaseCompleted(activeCase.id) ? '已经通关' : '正在挑战' }}</strong>
        </article>
        <article class="meta-card">
          <span>保存状态</span>
          <strong>{{ saveStatusLabel }}</strong>
        </article>
        <div v-if="isLoggedIn" class="header-actions">
          <div class="user-pill">当前账号：{{ currentUsername }}</div>
          <el-button size="large" @click="goToProgress">学习进度</el-button>
          <el-button size="large" plain @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </header>

    <section class="mission-banner">
      <div class="mission-copy">
        <span class="section-label">这关的任务</span>
        <h2>{{ activeCase.goal }}</h2>
        <p>{{ activeCase.tip }}</p>
      </div>

      <div class="mission-side">
        <article class="mission-card">
          <span>这关主要用</span>
          <div class="focus-tags">
            <strong v-for="item in activeCase.focusBlocks" :key="item">{{ item }}</strong>
          </div>
        </article>

        <article class="mission-card">
          <span>你可以这样做</span>
          <ol>
            <li v-for="step in activeCase.taskSteps" :key="step">{{ step }}</li>
          </ol>
        </article>
      </div>
    </section>

    <div ref="workspaceLayoutRef" class="workspace" :style="workspaceStyle">
      <aside class="helper-panel">
        <article class="helper-card feedback-card" :class="resultTone">
          <span class="section-label">{{ resultTitle }}</span>
          <h3>{{ resultHeadline }}</h3>
          <p>{{ resultMessage }}</p>

          <div v-if="lastResult.success" class="reward-stars">
            <span
              v-for="index in 3"
              :key="index"
              :class="{ active: index <= lastResult.stars }"
            >
              ⭐
            </span>
          </div>
        </article>

        <article class="helper-card">
          <span class="section-label">操作顺序</span>
          <div class="guide-list">
            <div
              v-for="(item, index) in guideSteps"
              :key="item.title"
              class="guide-item"
              :class="{ active: currentGuideStep === index + 1 }"
            >
              <strong>{{ index + 1 }}</strong>
              <div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </article>

        <CharacterPanel />
        <BackgroundSelector />
      </aside>

      <button
        type="button"
        class="panel-divider helper-divider"
        :class="{ active: activeResize.mode === 'helper' }"
        title="拖动调大小，双击恢复默认"
        aria-label="调节左侧帮助区宽度"
        @pointerdown="startResize($event, 'helper')"
        @dblclick="resetResizeTarget('helper')"
      >
        <span class="divider-grip"></span>
      </button>

      <section class="editor-panel">
        <div class="editor-top">
          <div class="case-picker">
            <span class="section-label">切换关卡</span>
            <el-select v-model="selectedCaseId" size="large" class="case-select" @change="handleCaseChange">
              <el-option
                v-for="item in cases"
                :key="item.id"
                :label="`第 ${item.id} 关 · ${item.shortTitle}`"
                :value="item.id"
                :disabled="!canAccessCase(item.id)"
              />
            </el-select>
          </div>

          <div class="action-bar">
            <el-button type="primary" size="large" @click="runProgram" :loading="running">开始运行</el-button>
            <el-button size="large" @click="resetProgram">回到起点</el-button>
            <el-button size="large" @click="clearWorkspace">重新拼这关</el-button>
            <el-button type="success" size="large" @click="saveWork">收藏作品</el-button>
          </div>
        </div>

        <div class="workspace-tip">
          <span>把动作积木接到“点击开始”下面；移动积木里的数字就是移动距离。</span>
          <div class="editor-actions">
            <el-button size="small" @click="zoomIn">放大</el-button>
            <el-button size="small" @click="zoomOut">缩小</el-button>
            <el-button size="small" @click="toggleGrid">
              {{ showGrid ? '隐藏网格' : '显示网格' }}
            </el-button>
          </div>
        </div>

        <div class="size-toolbar">
          <div class="size-toolbar-head">
            <div>
              <span class="section-label">模块大小</span>
              <strong>{{ currentSizePresetLabel }}</strong>
            </div>

            <div class="preset-actions">
              <el-button size="small" :type="isPresetActive('compact') ? 'primary' : 'default'" @click="applySizePreset('compact')">
                紧凑
              </el-button>
              <el-button size="small" :type="isPresetActive('standard') ? 'primary' : 'default'" @click="applySizePreset('standard')">
                标准
              </el-button>
              <el-button size="small" :type="isPresetActive('spacious') ? 'primary' : 'default'" @click="applySizePreset('spacious')">
                宽松
              </el-button>
            </div>
          </div>

          <div class="size-sliders">
            <label class="size-item">
              <span>左侧帮助 {{ helperPanelWidth }}px</span>
              <el-slider v-model="helperPanelWidth" :min="240" :max="380" :step="20" />
            </label>

            <label class="size-item">
              <span>代码预览 {{ codePanelWidth }}px</span>
              <el-slider v-model="codePanelWidth" :min="240" :max="420" :step="20" />
            </label>

            <label class="size-item">
              <span>地图区域 {{ previewPanelWidth }}px</span>
              <el-slider v-model="previewPanelWidth" :min="320" :max="520" :step="20" />
            </label>

            <label class="size-item">
              <span>积木大小 {{ blockScaleLabel }}</span>
              <el-slider v-model="blockScalePercent" :min="90" :max="150" :step="10" />
            </label>
          </div>
        </div>

        <div ref="editorWorkbenchRef" class="editor-workbench" :class="{ 'code-collapsed': codePanelCollapsed }">
          <div ref="blocklyDiv" class="blockly-area"></div>

          <button
            v-if="codePanelCollapsed"
            type="button"
            class="code-toggle-tab"
            title="Expand code preview"
            aria-label="Expand code preview"
            @click="setCodePanelCollapsed(false)"
          >
            展开代码
          </button>

          <button
            v-if="!codePanelCollapsed"
            type="button"
            class="code-hide-button"
            title="Collapse code preview"
            aria-label="Collapse code preview"
            @click="setCodePanelCollapsed(true)"
          >
            收起代码
          </button>

          <button
            v-if="!codePanelCollapsed"
            type="button"
            class="panel-divider code-divider"
            :class="{ active: activeResize.mode === 'code' }"
            title="拖动调大小，双击恢复默认"
            aria-label="调节代码预览宽度"
            @pointerdown="startResize($event, 'code')"
            @dblclick="resetResizeTarget('code')"
          >
            <span class="divider-grip"></span>
          </button>

          <aside v-if="!codePanelCollapsed" class="code-panel">
            <div class="code-panel-head">
              <div>
                <span class="section-label">代码预览</span>
                <h4>积木对应的代码形式</h4>
              </div>
              <span class="code-hint">会跟着积木实时更新</span>
            </div>

            <div class="code-preview">
              <div
                v-for="(line, index) in codeLines"
                :key="`${index}-${line}`"
                class="code-line"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <code>{{ line || ' ' }}</code>
              </div>
            </div>
          </aside>
        </div>

        <div class="code-actions-bar">
          <el-button size="small" @click="setCodePanelCollapsed(!codePanelCollapsed)">
            {{ codePanelCollapsed ? '展开代码' : '收起代码' }}
          </el-button>
        </div>

        <div class="editor-footer">
          <span>左边拖积木，右边会显示更像代码的写法。</span>
          <strong>{{ saveStatusLabel }}</strong>
        </div>
      </section>

      <button
        type="button"
        class="panel-divider preview-divider"
        :class="{ active: activeResize.mode === 'preview' }"
        title="拖动调大小，双击恢复默认"
        aria-label="调节地图区域宽度"
        @pointerdown="startResize($event, 'preview')"
        @dblclick="resetResizeTarget('preview')"
      >
        <span class="divider-grip"></span>
      </button>

      <section ref="previewPanelRef" class="preview-panel">
        <div class="preview-header">
          <div>
            <span class="section-label">地图预览</span>
            <h3>{{ activeCase.shortTitle }}</h3>
          </div>

          <div class="preview-tools">
            <div class="status-row">
              <span>位置 ({{ roundedX }}, {{ roundedY }})</span>
              <span>方向 {{ currentDirectionMeta.arrow }} {{ currentDirectionMeta.label }}</span>
              <span>本关星级 {{ currentCaseStars }}/3</span>
              <span>{{ starProgressText }}</span>
              <span v-if="stageSignalLabel">{{ stageSignalLabel }}</span>
            </div>
            <div class="map-actions">
              <el-button size="small" @click="zoomOutMap">地图缩小</el-button>
              <span>{{ mapZoomLabel }}</span>
              <el-button size="small" @click="zoomInMap">地图放大</el-button>
              <el-button size="small" @click="resetMapZoom">重置</el-button>
            </div>
          </div>
        </div>

        <div class="map-shell">
          <div class="map-viewport" :style="mapViewportStyle">
            <div class="map-canvas" :style="mapCanvasStyle">
              <div ref="stageDiv" class="stage" :style="stageStyle">
                <div class="grid-overlay" :class="{ hidden: !showGrid }"></div>

                <div class="axis axis-x"></div>
                <div class="axis axis-y"></div>
                <div class="axis-title axis-title-x">X</div>
                <div class="axis-title axis-title-y">Y</div>

                <div
                  v-for="tick in coordinateTicks"
                  :key="`top-${tick}`"
                  class="tick-label top"
                  :style="{ left: `${tick}%` }"
                >
                  {{ tick }}
                </div>

                <div
                  v-for="tick in coordinateTicks"
                  :key="`left-${tick}`"
                  class="tick-label left"
                  :style="{ top: `${tick}%` }"
                >
                  {{ tick }}
                </div>

                <div
                  v-if="activeCase.stage.target"
                  class="stage-target"
                  :style="stageTargetStyle"
                >
                  <span>{{ activeCase.stage.target.icon }}</span>
                  <small>{{ activeCase.stage.target.x }}, {{ activeCase.stage.target.y }}</small>
                </div>

                <div
                  v-for="star in activeCase.stage.stars"
                  :key="star.id"
                  class="stage-star"
                  :class="{ collected: collectedStarIds.includes(star.id) }"
                  :style="starStyle(star)"
                >
                  <span>{{ star.icon }}</span>
                  <small>{{ star.x }}, {{ star.y }}</small>
                </div>

                <div
                  v-for="obstacle in activeCase.stage.obstacles"
                  :key="obstacle.id"
                  class="stage-obstacle"
                  :class="{ hit: hitObstacleIds.includes(obstacle.id), 'is-line': isLineObstacle(obstacle) }"
                  :style="obstacleStyle(obstacle)"
                >
                  <div v-if="isLineObstacle(obstacle)" class="stage-obstacle-line" :style="obstacleLineStyle(obstacle)"></div>
                  <span v-if="obstacle.icon">{{ obstacle.icon }}</span>
                  <small>{{ obstacleLabel(obstacle) }}</small>
                </div>

                <div
                  v-for="point in activeCase.stage.guidePoints || []"
                  :key="point.id"
                  class="guide-point"
                  :style="guidePointStyle(point)"
                >
                  <small>{{ point.x }}, {{ point.y }}</small>
                </div>

                <div v-if="speechMessage" class="speech-bubble" :style="speechStyle">
                  {{ speechMessage }}
                </div>

                <div class="character" :style="characterStyle">
                  <span class="direction-arrow" :style="characterArrowStyle">
                    {{ currentDirectionMeta.arrow }}
                  </span>
                  <div class="character-body" :style="characterBodyStyle">
                    <img :src="characterImage" :alt="currentCharacterLabel" />
                  </div>
                  <small>{{ roundedX }}, {{ roundedY }} · {{ currentDirectionMeta.label }}</small>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="map-resize-handle"
            title="Drag to resize map"
            aria-label="Resize map viewport"
            @pointerdown="startMapResize"
            @dblclick="resetMapFrameSize"
          >
            <span></span>
          </button>
        </div>

        <div class="info-list">
          <article class="info-card">
            <strong>现在发生了什么</strong>
            <p>{{ runtimeStageStatusText }}</p>
          </article>

          <article class="info-card">
            <strong>小提示</strong>
            <p>{{ activeCase.helperText }}</p>
          </article>

          <article class="info-card" v-if="nextCase && progressStore.isCaseUnlocked(nextCase.id)">
            <strong>下一关已经解锁</strong>
            <p>{{ nextCase.shortTitle }}</p>
            <el-button size="large" @click="goToNextCase">去下一关</el-button>
          </article>
        </div>
      </section>
    </div>

    <el-dialog v-model="dialogVisible" title="收藏作品" width="420px">
      <p class="save-dialog-tip">给你的作品起个名字，下次更容易找到它。</p>
      <el-input v-model="workName" placeholder="例如：小猫回家第一次成功" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSave">{{ saveActionLabel }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CharacterPanel from '@/components/CharacterPanel.vue'
import BackgroundSelector from '@/components/BackgroundSelector.vue'
import { BlockUtils, BlockExecutor } from '@/utils/blocklyUtils'
import { CharacterState, ExecutionEngine } from '@/utils/characterEngine'
import { getDirectionMeta } from '@/utils/direction'
import { useCharacterStore } from '@/store/character'
import { useBackgroundStore } from '@/store/background'
import { useCaseStore } from '@/store/case'
import { useProgressStore } from '@/store/progress'
import { useUserStore } from '@/store/user'
import { getUserRecords, saveLearningRecord } from '@/api/record'

const router = useRouter()
const route = useRoute()
const workspaceLayoutRef = ref(null)
const editorWorkbenchRef = ref(null)
const previewPanelRef = ref(null)
const blocklyDiv = ref(null)
const stageDiv = ref(null)
const running = ref(false)
const dialogVisible = ref(false)
const workName = ref('')
const showGrid = ref(true)
const mapZoom = ref(1)
const generatedCode = ref('whenStartClicked()\n  // 先把积木拖进来')
const speechMessage = ref('')
const selectedCaseId = ref(Number(route.query.caseId) || 1)
const resultMessage = ref('准备好了就点击“开始运行”，看看角色会不会按你的想法行动。')
const collectedStarIds = ref([])
const hitObstacleIds = ref([])
const waitedMs = ref(0)
const moveActionCount = ref(0)
const saveStatus = ref('这关已经准备好')
const lastSavedAt = ref(null)
const remoteWorkPayloads = ref({})
const lastResult = ref({
  attempted: false,
  success: false,
  stars: 0
})
const PANEL_LIMITS = Object.freeze({
  helper: { min: 240, max: 380 },
  code: { min: 240, max: 420 },
  preview: { min: 320, max: 520 },
  blockScale: { min: 90, max: 150 }
})
const PANEL_PRESETS = Object.freeze({
  compact: { helper: 260, code: 260, preview: 340, blockScale: 96 },
  standard: { helper: 300, code: 320, preview: 380, blockScale: 108 },
  spacious: { helper: 340, code: 380, preview: 460, blockScale: 120 }
})
const PANEL_DIVIDER_WIDTH = 18
const MIN_EDITOR_PANEL_WIDTH = 460
const MIN_EDITOR_PANEL_WIDTH_NARROW = 420
const MIN_BLOCKLY_WIDTH = 320
const MAP_FRAME_LIMITS = Object.freeze({
  min: 280,
  max: 680
})
const MAP_FRAME_DEFAULT_SIZE = 520

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value))
const readUiSetting = (key, fallback, min, max) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = Number(window.localStorage.getItem(key))
  return Number.isFinite(value) ? clampValue(value, min, max) : fallback
}

const helperPanelWidth = ref(
  readUiSetting('kid-lab:helper-panel-width', PANEL_PRESETS.standard.helper, PANEL_LIMITS.helper.min, PANEL_LIMITS.helper.max)
)
const codePanelWidth = ref(
  readUiSetting('kid-lab:code-panel-width', PANEL_PRESETS.standard.code, PANEL_LIMITS.code.min, PANEL_LIMITS.code.max)
)
const previewPanelWidth = ref(
  readUiSetting('kid-lab:preview-panel-width', PANEL_PRESETS.standard.preview, PANEL_LIMITS.preview.min, PANEL_LIMITS.preview.max)
)
const mapFrameSize = ref(
  readUiSetting('kid-lab:map-frame-size', MAP_FRAME_DEFAULT_SIZE, MAP_FRAME_LIMITS.min, MAP_FRAME_LIMITS.max)
)
const blockScalePercent = ref(
  readUiSetting('kid-lab:block-scale', PANEL_PRESETS.standard.blockScale, PANEL_LIMITS.blockScale.min, PANEL_LIMITS.blockScale.max)
)
const codePanelCollapsed = ref(readUiSetting('kid-lab:code-panel-collapsed', 0, 0, 1) === 1)
const activeResize = reactive({
  mode: '',
  startX: 0,
  helperWidth: PANEL_PRESETS.standard.helper,
  previewWidth: PANEL_PRESETS.standard.preview,
  codeWidth: PANEL_PRESETS.standard.code
})
const mapResize = reactive({
  active: false,
  startX: 0,
  startY: 0,
  startSize: MAP_FRAME_DEFAULT_SIZE
})

const characterStore = useCharacterStore()
const backgroundStore = useBackgroundStore()
const caseStore = useCaseStore()
const progressStore = useProgressStore()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn || !!userStore.token)
const isParentAccount = computed(() => userStore.getUserRole === 'parent')
const currentUsername = computed(() => userStore.getUsername || '当前账号')

caseStore.initializeCases({
  preservePreview: String(route.query.adminPreview || '') === '1'
})
progressStore.loadLocalProgress(userStore.getUserId)

const syncProgressFromBackend = async () => {
  if (userStore.getUserId) {
    await progressStore.fetchProgress(userStore.getUserId)
  }
}

const { currentCharacter, characterProps } = storeToRefs(characterStore)

const characterState = reactive(new CharacterState())
const characterEngine = ref(null)

const MAP_MAX = 100
const MAP_ICON_SIZE = 6
const coordinateTicks = Array.from({ length: 11 }, (_, index) => index * 10)
const SIGNAL_LABELS = Object.freeze({
  red: '红色',
  blue: '蓝色',
  green: '绿色'
})

let workspace = null
let speechTimer = null
let runMetrics = null
let workspaceResizeTimer = null
let layoutResizeObserver = null

const isAdminPreviewMode = computed(() => userStore.getUserRole === 'admin' || String(route.query.adminPreview || '') === '1')
const cases = computed(() => (isAdminPreviewMode.value ? caseStore.getCasesForLab : caseStore.cases))
const activeCase = computed(() => caseStore.getCaseById(selectedCaseId.value))
const currentCaseStars = computed(() => progressStore.getCaseProgress(activeCase.value.id).stars)
const nextCase = computed(() => cases.value.find((item) => item.id === activeCase.value.id + 1) || null)
const saveActionLabel = computed(() => (userStore.getUserId ? '保存到账号' : '保存到本地'))
const characterImage = computed(() => characterStore.getCurrentImage)
const currentCharacterLabel = computed(() => characterStore.getCurrentCharacter?.name || '角色')
const roundedX = computed(() => Math.round(characterState.x))
const roundedY = computed(() => Math.round(characterState.y))
const currentDirectionMeta = computed(() => getDirectionMeta(characterState.direction))
const codeLines = computed(() => generatedCode.value.split('\n'))
const mapZoomLabel = computed(() => `${Math.round(mapZoom.value * 100)}%`)
const formatStageSignal = (signal) => {
  const normalized = String(signal || '').trim().toLowerCase()
  return SIGNAL_LABELS[normalized] || (signal ? String(signal) : '')
}
const resolveSignalSequence = (initialSignal, sequence, currentValue, stepField) => {
  if (!Array.isArray(sequence) || !sequence.length) {
    return initialSignal
  }

  return sequence.reduce((result, item) => {
    return currentValue >= Number(item?.[stepField] || 0) ? item.signal || result : result
  }, sequence[0].signal || initialSignal || '')
}
const resolveStageSignal = (caseInfo, currentWaitedMs = 0, currentMoveCount = 0) => {
  const stage = caseInfo?.stage
  let signal = stage?.signal || ''

  signal = resolveSignalSequence(signal, stage?.signalTimeline, currentWaitedMs, 'afterWaitMs')
  signal = resolveSignalSequence(signal, stage?.signalMoveSequence, currentMoveCount, 'afterMoveCount')

  return signal
}
const currentStageSignal = computed(() => resolveStageSignal(activeCase.value, waitedMs.value, moveActionCount.value))
const mapViewportStyle = computed(() => ({
  width: `${mapFrameSize.value}px`,
  height: `${mapFrameSize.value}px`
}))
const mapCanvasStyle = computed(() => ({
  width: `${mapFrameSize.value * mapZoom.value}px`,
  height: `${mapFrameSize.value * mapZoom.value}px`
}))
const starProgressText = computed(() => {
  const totalStars = activeCase.value.stage.stars.length
  if (!totalStars) {
    return '这关没有星星任务'
  }

  return `已收集 ${collectedStarIds.value.length}/${totalStars} 颗星星`
})
const stageSignalLabel = computed(() => {
  const label = formatStageSignal(currentStageSignal.value)
  return label ? `当前信号 ${label}` : ''
})
const runtimeStageStatusText = computed(() => {
  if (running.value) {
    return stageSignalLabel.value ? `程序正在运行，观察 ${stageSignalLabel.value} 会进入哪一条分支。` : '角色正在按积木顺序行动。'
  }

  if (lastResult.value.success) {
    return `你已经完成这关了，目前本关最高星级是 ${currentCaseStars.value} 星。`
  }

  if (hitObstacleIds.value.length > 0) {
    return `刚才撞到了 ${hitObstacleIds.value.length} 个障碍，换一条路线会更安全。`
  }

  if (activeCase.value.stage.stars.length > 0) {
    return `目前已经收集 ${collectedStarIds.value.length} / ${activeCase.value.stage.stars.length} 颗星星。`
  }

  if (stageSignalLabel.value) {
    if (activeCase.value.stage.signalMoveSequence?.length) {
      return `这关开始是 ${stageSignalLabel.value}，每移动一次都会继续变灯，试着在每次移动后再判断一次。`
    }

    return `这关有 ${stageSignalLabel.value}，试着让程序根据不同信号走不同分支。`
  }

  return activeCase.value.helperText || '先拖积木，再点击开始运行。'
})
const stageStyle = computed(() => ({
  background: backgroundStore.getCurrentBackground?.color || backgroundStore.backgrounds[0].color,
  transform: `scale(${mapZoom.value})`,
  transformOrigin: 'top left',
  width: `${mapFrameSize.value}px`,
  height: `${mapFrameSize.value}px`
}))
const saveStatusLabel = computed(() => {
  if (!lastSavedAt.value) {
    return saveStatus.value
  }

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(lastSavedAt.value)

  return `${saveStatus.value} ${formatted}`
})
const blockScaleLabel = computed(() => `${blockScalePercent.value}%`)
const workspaceStyle = computed(() => ({
  '--helper-panel-width': `${helperPanelWidth.value}px`,
  '--preview-panel-width': `${previewPanelWidth.value}px`,
  '--code-panel-width': codePanelCollapsed.value ? '0px' : `${codePanelWidth.value}px`,
  '--blockly-min-height': `${Math.max(520, Math.round(420 + blockScalePercent.value))}px`,
  '--panel-divider-width': '18px',
  '--code-divider-width': codePanelCollapsed.value ? '0px' : '18px'
}))
const currentSizePreset = computed(() => {
  const match = Object.entries(PANEL_PRESETS).find(([, preset]) => {
    return (
      preset.helper === helperPanelWidth.value &&
      preset.code === codePanelWidth.value &&
      preset.preview === previewPanelWidth.value &&
      preset.blockScale === blockScalePercent.value
    )
  })

  return match?.[0] || 'custom'
})
const currentSizePresetLabel = computed(() => {
  if (currentSizePreset.value === 'compact') {
    return '紧凑'
  }

  if (currentSizePreset.value === 'spacious') {
    return '宽松'
  }

  if (currentSizePreset.value === 'standard') {
    return '标准'
  }

  return '自定义'
})
const guideSteps = computed(() => [
  {
    title: '先拼积木',
    description: activeCase.value.taskSteps?.[0] || activeCase.value.helperText
  },
  {
    title: '点开始运行',
    description: activeCase.value.taskSteps?.[1] || '看看角色会不会按顺序行动。'
  },
  {
    title: '根据结果调整',
    description: activeCase.value.taskSteps?.[2] || '差一点也没关系，改一改再试一次。'
  }
])
const currentGuideStep = computed(() => {
  if (running.value) {
    return 2
  }

  if (lastResult.value.attempted) {
    return 3
  }

  return 1
})
const resultTone = computed(() => {
  if (running.value) {
    return 'running'
  }

  if (lastResult.value.success) {
    return 'success'
  }

  if (lastResult.value.attempted) {
    return 'warning'
  }

  return 'idle'
})
const resultTitle = computed(() => {
  if (running.value) {
    return '角色正在行动'
  }

  if (lastResult.value.success) {
    return '通关成功'
  }

  if (lastResult.value.attempted) {
    return '差一点点'
  }

  return '准备开始'
})
const resultHeadline = computed(() => {
  if (running.value) {
    return '看看舞台上的角色怎么走'
  }

  if (lastResult.value.success) {
    return `太棒了，你拿到了 ${lastResult.value.stars} 颗星星`
  }

  if (lastResult.value.attempted) {
    return '修改一下积木，再试一次'
  }

  return '这关只需要一步一步来'
})

const stageTargetStyle = computed(() => {
  if (!activeCase.value.stage.target) {
    return {}
  }

  return {
    left: `${activeCase.value.stage.target.x}%`,
    top: `${activeCase.value.stage.target.y}%`,
    width: `${MAP_ICON_SIZE}%`,
    height: `${MAP_ICON_SIZE}%`
  }
})

const characterStyle = computed(() => ({
  left: `${characterState.x}%`,
  top: `${characterState.y}%`,
  width: `${getCharacterSize()}%`,
  height: `${getCharacterSize()}%`,
  display: characterState.visible ? 'flex' : 'none'
}))

const characterBodyStyle = computed(() => ({
  transform: `rotate(${characterState.direction * 90}deg)`
}))

const characterArrowStyle = computed(() => {
  switch (currentDirectionMeta.value.shortLabel) {
    case '下':
      return {
        left: '50%',
        top: 'calc(100% + 8px)',
        transform: 'translateX(-50%)'
      }
    case '左':
      return {
        right: 'calc(100% + 8px)',
        top: '50%',
        transform: 'translateY(-50%)'
      }
    case '上':
      return {
        left: '50%',
        bottom: 'calc(100% + 8px)',
        transform: 'translateX(-50%)'
      }
    case '右':
    default:
      return {
        left: 'calc(100% + 8px)',
        top: '50%',
        transform: 'translateY(-50%)'
      }
  }
})

const speechStyle = computed(() => ({
  left: `${Math.max(4, characterState.x)}%`,
  top: `${Math.max(4, characterState.y - 10)}%`
}))

const persistUiSetting = (key, value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, String(value))
}

const queueWorkspaceResize = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.clearTimeout(workspaceResizeTimer)
  workspaceResizeTimer = window.setTimeout(() => {
    workspaceResizeTimer = null

    const runResize = () => {
      BlockUtils.resizeWorkspace(workspace)
    }

    nextTick(() => {
      runResize()

      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
          nextTick(runResize)
        })
      }
    })
  }, 60)
}

const applyBlocklyScale = () => {
  if (!workspace) {
    return
  }

  BlockUtils.setWorkspaceScale(workspace, blockScalePercent.value / 100)
  queueWorkspaceResize()
}

const syncBlockScaleFromWorkspace = () => {
  if (!workspace?.scale) {
    return
  }

  blockScalePercent.value = clampValue(
    Math.round(workspace.scale * 100),
    PANEL_LIMITS.blockScale.min,
    PANEL_LIMITS.blockScale.max
  )
}

const isPresetActive = (presetName) => currentSizePreset.value === presetName

const applySizePreset = (presetName) => {
  const preset = PANEL_PRESETS[presetName]
  if (!preset) {
    return
  }

  helperPanelWidth.value = preset.helper
  codePanelWidth.value = preset.code
  previewPanelWidth.value = preset.preview
  blockScalePercent.value = preset.blockScale
}

const setCodePanelCollapsed = (collapsed) => {
  codePanelCollapsed.value = collapsed

  nextTick(() => {
    if (!collapsed) {
      normalizePanelWidths()
    }

    queueWorkspaceResize()
  })
}

const bindLayoutResizeObserver = () => {
  if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function' || !blocklyDiv.value) {
    return
  }

  layoutResizeObserver?.disconnect()
  layoutResizeObserver = new window.ResizeObserver(() => {
    queueWorkspaceResize()
  })
  layoutResizeObserver.observe(blocklyDiv.value)
}

const unbindLayoutResizeObserver = () => {
  layoutResizeObserver?.disconnect()
  layoutResizeObserver = null
}

const getWorkspaceWidth = () => workspaceLayoutRef.value?.clientWidth || 0
const getEditorWorkbenchWidth = () => editorWorkbenchRef.value?.clientWidth || 0
const getPreviewPanelInnerWidth = () => previewPanelRef.value?.clientWidth || 0

const getMapFrameMaxSize = () => {
  const previewWidth = getPreviewPanelInnerWidth()
  if (!previewWidth) {
    return MAP_FRAME_LIMITS.max
  }

  const available = previewWidth - 58
  return Math.max(MAP_FRAME_LIMITS.min, Math.min(MAP_FRAME_LIMITS.max, available))
}

const normalizeMapFrameSize = () => {
  mapFrameSize.value = clampValue(mapFrameSize.value, MAP_FRAME_LIMITS.min, getMapFrameMaxSize())
}

const resetMapFrameSize = () => {
  mapFrameSize.value = clampValue(MAP_FRAME_DEFAULT_SIZE, MAP_FRAME_LIMITS.min, getMapFrameMaxSize())
}

const getHelperMaxWidth = () => {
  const workspaceWidth = getWorkspaceWidth()
  if (!workspaceWidth || typeof window === 'undefined') {
    return PANEL_LIMITS.helper.max
  }

  if (window.innerWidth > 1300) {
    return Math.max(
      PANEL_LIMITS.helper.min,
      Math.min(
        PANEL_LIMITS.helper.max,
        workspaceWidth - previewPanelWidth.value - PANEL_DIVIDER_WIDTH * 2 - MIN_EDITOR_PANEL_WIDTH
      )
    )
  }

  return Math.max(
    PANEL_LIMITS.helper.min,
    Math.min(PANEL_LIMITS.helper.max, workspaceWidth - PANEL_DIVIDER_WIDTH - MIN_EDITOR_PANEL_WIDTH_NARROW)
  )
}

const getPreviewMaxWidth = () => {
  const workspaceWidth = getWorkspaceWidth()
  if (!workspaceWidth) {
    return PANEL_LIMITS.preview.max
  }

  return Math.max(
    PANEL_LIMITS.preview.min,
    Math.min(
      PANEL_LIMITS.preview.max,
      workspaceWidth - helperPanelWidth.value - PANEL_DIVIDER_WIDTH * 2 - MIN_EDITOR_PANEL_WIDTH
    )
  )
}

const getCodeMaxWidth = () => {
  const editorWidth = getEditorWorkbenchWidth()
  if (!editorWidth) {
    return PANEL_LIMITS.code.max
  }

  return Math.max(
    PANEL_LIMITS.code.min,
    Math.min(PANEL_LIMITS.code.max, editorWidth - PANEL_DIVIDER_WIDTH - MIN_BLOCKLY_WIDTH)
  )
}

const normalizePanelWidths = () => {
  if (typeof window === 'undefined' || window.innerWidth <= 980) {
    return
  }

  helperPanelWidth.value = clampValue(
    helperPanelWidth.value,
    PANEL_LIMITS.helper.min,
    getHelperMaxWidth()
  )

  if (window.innerWidth > 1300) {
    previewPanelWidth.value = clampValue(
      previewPanelWidth.value,
      PANEL_LIMITS.preview.min,
      getPreviewMaxWidth()
    )
  }

  codePanelWidth.value = clampValue(
    codePanelWidth.value,
    PANEL_LIMITS.code.min,
    getCodeMaxWidth()
  )
}

const resetResizeTarget = (mode) => {
  if (mode === 'helper') {
    helperPanelWidth.value = PANEL_PRESETS.standard.helper
  }

  if (mode === 'preview') {
    previewPanelWidth.value = PANEL_PRESETS.standard.preview
  }

  if (mode === 'code') {
    codePanelWidth.value = PANEL_PRESETS.standard.code
  }

  normalizePanelWidths()
  queueWorkspaceResize()
}

const stopResize = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', handleResizePointerMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
    window.document.body.style.userSelect = ''
    window.document.body.style.cursor = ''
  }

  activeResize.mode = ''
}

function handleResizePointerMove(event) {
  if (!activeResize.mode) {
    return
  }

  const deltaX = event.clientX - activeResize.startX

  if (activeResize.mode === 'helper') {
    helperPanelWidth.value = clampValue(
      activeResize.helperWidth + deltaX,
      PANEL_LIMITS.helper.min,
      getHelperMaxWidth()
    )
  }

  if (activeResize.mode === 'preview') {
    previewPanelWidth.value = clampValue(
      activeResize.previewWidth - deltaX,
      PANEL_LIMITS.preview.min,
      getPreviewMaxWidth()
    )
  }

  if (activeResize.mode === 'code') {
    codePanelWidth.value = clampValue(
      activeResize.codeWidth - deltaX,
      PANEL_LIMITS.code.min,
      getCodeMaxWidth()
    )
  }

  queueWorkspaceResize()
}

const startResize = (event, mode) => {
  if (typeof window === 'undefined' || window.innerWidth <= 980) {
    return
  }

  if (mode === 'code' && codePanelCollapsed.value) {
    return
  }

  if (mode === 'preview' && window.innerWidth <= 1300) {
    return
  }

  event.preventDefault()
  activeResize.mode = mode
  activeResize.startX = event.clientX
  activeResize.helperWidth = helperPanelWidth.value
  activeResize.previewWidth = previewPanelWidth.value
  activeResize.codeWidth = codePanelWidth.value

  window.document.body.style.userSelect = 'none'
  window.document.body.style.cursor = 'col-resize'
  window.addEventListener('pointermove', handleResizePointerMove)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

const handleWindowResize = () => {
  normalizePanelWidths()
  normalizeMapFrameSize()
  queueWorkspaceResize()
}

const stopMapResize = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', handleMapResizePointerMove)
    window.removeEventListener('pointerup', stopMapResize)
    window.removeEventListener('pointercancel', stopMapResize)
    window.document.body.style.userSelect = ''
    window.document.body.style.cursor = ''
  }

  mapResize.active = false
}

function handleMapResizePointerMove(event) {
  if (!mapResize.active) {
    return
  }

  const deltaX = event.clientX - mapResize.startX
  const deltaY = event.clientY - mapResize.startY
  const delta = Math.round((deltaX + deltaY) / 2)

  mapFrameSize.value = clampValue(
    mapResize.startSize + delta,
    MAP_FRAME_LIMITS.min,
    getMapFrameMaxSize()
  )
}

const startMapResize = (event) => {
  if (typeof window === 'undefined' || window.innerWidth <= 980) {
    return
  }

  event.preventDefault()
  mapResize.active = true
  mapResize.startX = event.clientX
  mapResize.startY = event.clientY
  mapResize.startSize = mapFrameSize.value

  window.document.body.style.userSelect = 'none'
  window.document.body.style.cursor = 'nwse-resize'
  window.addEventListener('pointermove', handleMapResizePointerMove)
  window.addEventListener('pointerup', stopMapResize)
  window.addEventListener('pointercancel', stopMapResize)
}

const setSaveState = (label, savedAt = null) => {
  saveStatus.value = label
  lastSavedAt.value = savedAt
}

const markSaved = (label) => {
  saveStatus.value = label
  lastSavedAt.value = Date.now()
}

const updateRouteCase = (caseId) => {
  if (String(route.query.caseId || '') === String(caseId)) {
    return
  }

  router.replace({
    path: '/lab',
    query: {
      caseId
    }
  })
}

const getFirstUnlockedCaseId = () => {
  return cases.value.find((item) => progressStore.isCaseUnlocked(item.id))?.id || 1
}

const canAccessCase = (caseId) => {
  return isAdminPreviewMode.value || progressStore.isCaseUnlocked(caseId)
}

const resolveAccessibleCaseId = (caseId) => {
  const normalizedId = caseStore.getCaseById(caseId)?.id || getFirstUnlockedCaseId()
  return canAccessCase(normalizedId) ? normalizedId : getFirstUnlockedCaseId()
}

const getDraftStorageKey = (caseId) => `kids-programming-lab-draft-${caseId}`
const getSnapshotStorageKey = (caseId) => `kids-programming-lab-snapshot-${caseId}`

const getCharacterSize = () => 12 * (characterState.size / 100)
const isLineObstacle = (obstacle) => obstacle?.type === 'line'

const getObstacleThickness = (obstacle) => {
  return Math.max(1, Number(obstacle?.thickness) || 2)
}

const getObstacleBounds = (obstacle) => {
  if (!obstacle) {
    return null
  }

  if (isLineObstacle(obstacle)) {
    const thickness = getObstacleThickness(obstacle)
    const minX = Math.min(obstacle.x1, obstacle.x2)
    const maxX = Math.max(obstacle.x1, obstacle.x2)
    const minY = Math.min(obstacle.y1, obstacle.y2)
    const maxY = Math.max(obstacle.y1, obstacle.y2)
    const halfThickness = thickness / 2

    return {
      x: minX - halfThickness,
      y: minY - halfThickness,
      width: maxX - minX + thickness,
      height: maxY - minY + thickness
    }
  }

  return {
    x: obstacle.x,
    y: obstacle.y,
    width: obstacle.width,
    height: obstacle.height
  }
}

const isObstacleHit = (x, y, size, obstacle) => {
  const bounds = getObstacleBounds(obstacle)

  if (!bounds) {
    return false
  }

  return (
    x + size > bounds.x &&
    x < bounds.x + bounds.width &&
    y + size > bounds.y &&
    y < bounds.y + bounds.height
  )
}

const starStyle = (star) => ({
  left: `${star.x}%`,
  top: `${star.y}%`,
  width: `${MAP_ICON_SIZE}%`,
  height: `${MAP_ICON_SIZE}%`
})

const obstacleStyle = (obstacle) => {
  const bounds = getObstacleBounds(obstacle)

  return {
    left: `${bounds?.x || 0}%`,
    top: `${bounds?.y || 0}%`,
    width: `${bounds?.width || 0}%`,
    height: `${bounds?.height || 0}%`
  }
}

const obstacleLineStyle = (obstacle) => {
  const bounds = getObstacleBounds(obstacle)

  if (!bounds || !isLineObstacle(obstacle)) {
    return {}
  }

  const startX = obstacle.x1 - bounds.x
  const startY = obstacle.y1 - bounds.y
  const endX = obstacle.x2 - bounds.x
  const endY = obstacle.y2 - bounds.y
  const dx = endX - startX
  const dy = endY - startY
  const length = Math.sqrt(dx * dx + dy * dy) || getObstacleThickness(obstacle)
  const angle = Math.atan2(dy, dx) * 180 / Math.PI
  const widthBase = Math.max(bounds.width, 0.001)
  const heightBase = Math.max(bounds.height, 0.001)

  return {
    left: `${(((startX + endX) / 2) / widthBase) * 100}%`,
    top: `${(((startY + endY) / 2) / heightBase) * 100}%`,
    width: `${(length / widthBase) * 100}%`,
    height: `${(getObstacleThickness(obstacle) / heightBase) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`
  }
}

const obstacleLabel = (obstacle) => {
  if (isLineObstacle(obstacle)) {
    return `${Math.round(obstacle.x1)},${Math.round(obstacle.y1)}  ${Math.round(obstacle.x2)},${Math.round(obstacle.y2)}`
  }

  return `${Math.round(obstacle.x)}, ${Math.round(obstacle.y)}`
}

const guidePointStyle = (point) => ({
  left: `${point.x}%`,
  top: `${point.y}%`
})

const distanceBetween = (pointA, pointB) => {
  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  return Math.sqrt(dx * dx + dy * dy)
}

const getCharacterCenter = (x = characterState.x, y = characterState.y) => {
  const size = getCharacterSize()
  return {
    x: x + size / 2,
    y: y + size / 2
  }
}

const syncStateToStore = () => {
  characterStore.syncRuntimeState({
    x: characterState.x,
    y: characterState.y,
    direction: characterState.direction,
    size: characterState.size,
    visible: characterState.visible
  })
}

const applyStoreStateToCharacter = (props) => {
  characterState.x = props.x
  characterState.y = props.y
  characterState.direction = props.direction
  characterState.size = props.size
  characterState.visible = props.visible
}

const hideSpeech = () => {
  if (speechTimer) {
    clearTimeout(speechTimer)
    speechTimer = null
  }

  speechMessage.value = ''
}

const showSpeech = (message) => {
  hideSpeech()
  speechMessage.value = message
  speechTimer = setTimeout(() => {
    speechMessage.value = ''
    speechTimer = null
  }, 1800)
}

const createRunMetrics = (caseInfo) => ({
  caseId: caseInfo.id,
  collectedStars: new Set(),
  hitObstacles: new Set(),
  totalDistance: 0,
  lastPosition: null,
  minY: caseInfo.stage.start?.y ?? 0,
  maxY: caseInfo.stage.start?.y ?? 0
})

const ensureStarterBlock = () => {
  if (!workspace) {
    return
  }

  const hasStarter = workspace.getAllBlocks(false).some((block) => block.type === 'event_start')
  if (hasStarter) {
    return
  }

  const startBlock = workspace.newBlock('event_start')
  startBlock.initSvg()
  startBlock.render()
  startBlock.moveBy(40, 40)
}

const refreshCodePreview = () => {
  generatedCode.value = BlockUtils.generatePseudoCode(workspace)
}

const handleWorkspaceChange = () => {
  refreshCodePreview()
  persistDraft()
}

const loadWorkPayload = (storageKey) => {
  const raw = localStorage.getItem(storageKey)

  if (!raw) {
    return null
  }

  try {
    const payload = JSON.parse(raw)
    return payload?.version === 2 ? payload : null
  } catch (error) {
    console.error('解析作品存档失败:', error)
    return null
  }
}

const normalizeRemoteWorkPayload = (record) => {
  if (!record) {
    return null
  }

  const caseInfo = caseStore.getCaseById(record.caseId) || activeCase.value

  if (record.workspaceJson) {
    try {
      const payload = JSON.parse(record.workspaceJson)
      if (payload?.version === 2) {
        return payload
      }
    } catch (error) {
      console.error('解析账号作品失败:', error)
    }
  }

  if (!record.workspaceXml) {
    return null
  }

  return {
    version: 2,
    caseId: record.caseId,
    name: record.workName,
    xml: record.workspaceXml,
    characterId: caseInfo?.character || 'cat',
    backgroundId: caseInfo?.backgroundId || 'default',
    characterProps: null,
    savedAt: record.updateTime || record.createTime || Date.now()
  }
}

const loadRemoteWorkPayloads = async () => {
  if (!userStore.getUserId) {
    remoteWorkPayloads.value = {}
    return
  }

  try {
    const records = await getUserRecords(userStore.getUserId)
    const nextPayloads = {}

    ;(records?.data || []).forEach((record) => {
      if (!record?.caseId) {
        return
      }

      const payload = normalizeRemoteWorkPayload(record)
      if (!payload) {
        return
      }

      const previous = nextPayloads[record.caseId]
      const currentTime = new Date(record.updateTime || record.createTime || 0).getTime()
      const previousTime = previous?.savedAt ? new Date(previous.savedAt).getTime() : 0

      if (!previous || currentTime >= previousTime) {
        nextPayloads[record.caseId] = payload
      }
    })

    remoteWorkPayloads.value = nextPayloads
  } catch (error) {
    console.error('获取账号作品失败:', error)
  }
}

const buildWorkPayload = () => {
  if (!workspace) {
    return null
  }

  return {
    version: 2,
    caseId: activeCase.value.id,
    name: workName.value.trim() || `${activeCase.value.shortTitle} 作品`,
    xml: BlockUtils.workspaceToXml(workspace),
    characterId: currentCharacter.value,
    backgroundId: backgroundStore.currentBackground,
    characterProps: { ...characterStore.characterProps },
    savedAt: Date.now()
  }
}

const persistDraft = () => {
  const payload = buildWorkPayload()

  if (!payload) {
    return
  }

  localStorage.setItem(getDraftStorageKey(activeCase.value.id), JSON.stringify(payload))
  markSaved('已自动保存')
}

const applyCaseDefaults = (caseInfo, options = {}) => {
  const { preserveCharacter = false, preserveBackground = false } = options
  const start = caseInfo.stage.start || { x: 8, y: 44, direction: 0 }
  const startState = {
    x: start.x,
    y: start.y,
    direction: start.direction || 0,
    size: 100,
    visible: true
  }

  if (!preserveCharacter) {
    characterStore.setCharacter(caseInfo.character || 'cat')
  }

  if (!preserveBackground) {
    backgroundStore.setBackground(caseInfo.backgroundId || 'default')
  }

  characterStore.setStageStart(startState)
  applyStoreStateToCharacter(characterStore.characterProps)
  syncStateToStore()
  collectedStarIds.value = []
  hitObstacleIds.value = []
  waitedMs.value = 0
  moveActionCount.value = 0
  resultMessage.value = '准备好了就点击“开始运行”，看看角色会不会按你的想法行动。'
  lastResult.value = {
    attempted: false,
    success: false,
    stars: 0
  }
  workName.value = `${caseInfo.shortTitle} 作品`
}

const loadCaseWorkspace = (caseInfo, payload = null) => {
  if (!workspace) {
    return
  }

  BlockUtils.updateWorkspaceToolbox(workspace, caseInfo)
  BlockUtils.clearWorkspace(workspace)

  if (payload?.xml) {
    try {
      BlockUtils.loadWorkspaceFromXml(workspace, payload.xml)
    } catch (error) {
      console.error('恢复作品失败:', error)
    }
  } else if (caseInfo.initialWorkspace) {
    try {
      BlockUtils.loadWorkspaceFromXml(workspace, caseInfo.initialWorkspace)
    } catch (error) {
      console.error('加载默认工作区失败:', error)
    }
  }

  ensureStarterBlock()
  refreshCodePreview()
}

const applySavedPayload = (caseInfo, payload, options = {}) => {
  const { restoreRuntimeState = true } = options
  applyCaseDefaults(caseInfo)

  if (!payload) {
    loadCaseWorkspace(caseInfo)
    setSaveState('这关已经准备好')
    return
  }

  if (payload.characterId) {
    characterStore.setCharacter(payload.characterId)
  }

  if (payload.backgroundId) {
    backgroundStore.setBackground(payload.backgroundId)
  }

  if (restoreRuntimeState && payload.characterProps) {
    characterStore.syncRuntimeState(payload.characterProps)
    applyStoreStateToCharacter(characterStore.characterProps)
  }

  workName.value = payload.name || `${caseInfo.shortTitle} 作品`
  loadCaseWorkspace(caseInfo, payload)
  setSaveState(restoreRuntimeState ? '已恢复上次进度' : '已恢复这关积木，角色已回到起点', payload.savedAt || null)
}

const loadCurrentCase = (options = {}) => {
  const { restoreRuntimeState = true } = options
  const accessibleCaseId = resolveAccessibleCaseId(selectedCaseId.value)

  if (accessibleCaseId !== selectedCaseId.value) {
    selectedCaseId.value = accessibleCaseId
    updateRouteCase(accessibleCaseId)
  }

  const caseInfo = caseStore.getCaseById(accessibleCaseId)
  if (!caseInfo || !workspace) {
    return
  }

  const snapshot = loadWorkPayload(getSnapshotStorageKey(caseInfo.id))
  const draft = loadWorkPayload(getDraftStorageKey(caseInfo.id))
  const remotePayload = remoteWorkPayloads.value[caseInfo.id] || null

  caseStore.setCurrentCase(caseInfo.id)
  applySavedPayload(caseInfo, remotePayload || snapshot || draft, { restoreRuntimeState })
  runMetrics = createRunMetrics(caseInfo)
}

const updateRunMetricsOnMove = (x, y) => {
  if (!runMetrics) {
    return
  }

  if (runMetrics.lastPosition) {
    runMetrics.totalDistance += Math.abs(x - runMetrics.lastPosition.x) + Math.abs(y - runMetrics.lastPosition.y)
  }

  runMetrics.lastPosition = { x, y }
  runMetrics.minY = Math.min(runMetrics.minY, y)
  runMetrics.maxY = Math.max(runMetrics.maxY, y)

  const characterCenter = getCharacterCenter(x, y)
  const starTolerance = activeCase.value.evaluation.starTolerance || 8

  activeCase.value.stage.stars.forEach((star) => {
    if (runMetrics.collectedStars.has(star.id)) {
      return
    }

    const starCenter = { x: star.x + MAP_ICON_SIZE / 2, y: star.y + MAP_ICON_SIZE / 2 }
    if (distanceBetween(characterCenter, starCenter) <= starTolerance) {
      runMetrics.collectedStars.add(star.id)
      collectedStarIds.value = [...runMetrics.collectedStars]
    }
  })

  const size = getCharacterSize()

  activeCase.value.stage.obstacles.forEach((obstacle) => {
    if (isObstacleHit(x, y, size, obstacle)) {
      runMetrics.hitObstacles.add(obstacle.id)
      hitObstacleIds.value = [...runMetrics.hitObstacles]
    }
  })
}

const initializeBlockly = () => {
  workspace = BlockUtils.createWorkspace(blocklyDiv.value, activeCase.value, handleWorkspaceChange)
  applyBlocklyScale()
  ensureStarterBlock()
  refreshCodePreview()
  loadCurrentCase()
}

const initializeEngine = () => {
  characterEngine.value = new ExecutionEngine(characterState, {
    onMove: (x, y) => {
      characterStore.syncRuntimeState({ x, y })
      updateRunMetricsOnMove(x, y)
    },
    onTurn: (direction) => {
      characterStore.syncRuntimeState({ direction })
    },
    onShow: (visible) => {
      characterStore.syncRuntimeState({ visible })
    },
    onSay: (message) => {
      showSpeech(message)
    },
    onWait: (duration) => {
      waitedMs.value += duration
    },
    onMoveComplete: () => {
      moveActionCount.value += 1
    },
    getStageObstacles: () => activeCase.value.stage.obstacles || [],
    getStageSignal: () => resolveStageSignal(activeCase.value, waitedMs.value, moveActionCount.value),
    getStageBounds: () => ({
      width: MAP_MAX,
      height: MAP_MAX
    })
  })
}

const resetForRun = () => {
  hideSpeech()
  applyCaseDefaults(activeCase.value, {
    preserveCharacter: true,
    preserveBackground: true
  })
  runMetrics = createRunMetrics(activeCase.value)
}

const getBlockCounts = () => {
  return workspace ? BlockExecutor.countBlocks(workspace) : {}
}

const getRepeatMetrics = () => {
  if (!workspace) {
    return {
      total: 0,
      maxDepth: 0
    }
  }

  let total = 0
  let maxDepth = 0

  const visitSequence = (block, depth = 0) => {
    let current = block

    while (current) {
      let nextDepth = depth

      if (current.type === 'repeat') {
        total += 1
        nextDepth = depth + 1
        maxDepth = Math.max(maxDepth, nextDepth)
        visitSequence(current.getInputTargetBlock('DO'), nextDepth)
      }

      current = current.getNextBlock()
    }
  }

  workspace.getTopBlocks(true).forEach((block) => {
    visitSequence(block, 0)
  })

  return {
    total,
    maxDepth
  }
}

const reachedTarget = (target, tolerance = 8) => {
  if (!target) {
    return false
  }

  const characterCenter = getCharacterCenter()
  const targetCenter = { x: target.x + MAP_ICON_SIZE / 2, y: target.y + MAP_ICON_SIZE / 2 }
  return distanceBetween(characterCenter, targetCenter) <= tolerance
}

const getMovementBlockCount = (counts) =>
  (counts.move_up || 0) +
  (counts.move_down || 0) +
  (counts.move_forward || 0) +
  (counts.move_backward || 0) +
  (counts.move_left || 0) +
  (counts.move_right || 0) +
  (counts.move_steps || 0)

const usedObstacleDetour = (metrics, evaluation) => {
  const detour = evaluation?.detour

  if (!detour) {
    return true
  }

  const reachedUpperLane = Number.isFinite(detour.maxY) && metrics.minY <= detour.maxY
  const reachedLowerLane = Number.isFinite(detour.minY) && metrics.maxY >= detour.minY

  return reachedUpperLane || reachedLowerLane
}

const evaluateAvoidObstacleResult = (caseInfo, counts, metrics) => {
  const reachedFinish = reachedTarget(caseInfo.stage.target, caseInfo.evaluation.tolerance)
  const hitObstacle = metrics.hitObstacles.size > 0
  const detoured = usedObstacleDetour(metrics, caseInfo.evaluation)

  if (!reachedFinish) {
    return {
      success: false,
      stars: 0,
      message: '离终点还差一点点，把路线补完整。'
    }
  }

  if (hitObstacle) {
    return {
      success: false,
      stars: 0,
      message: '刚才撞到了整条路障，先转向绕开，再去终点。'
    }
  }

  if (!detoured) {
    return {
      success: false,
      stars: 0,
      message: '这关的路障是一整条拦线，路线还不够绕开它。'
    }
  }

  const enoughTurns = (counts.turn_left || 0) + (counts.turn_right || 0) >= 2
  const compactRoute = getMovementBlockCount(counts) <= 4
  const earnedThreeStars = enoughTurns || compactRoute

  return {
    success: true,
    stars: earnedThreeStars ? 3 : 2,
    message: earnedThreeStars
      ? '你已经绕开整条路障，还顺利到达了终点。'
      : '已经安全到终点了，再把路线整理得更利落一些。'
  }
}

const evaluateMissionResult = () => {
  const caseInfo = activeCase.value
  const counts = getBlockCounts()
  const repeatMetrics = getRepeatMetrics()
  const evaluation = caseInfo.evaluation
  const currentSignal = formatStageSignal(currentStageSignal.value)

  switch (evaluation.type) {
    case 'reach-target': {
      const success = reachedTarget(caseInfo.stage.target, evaluation.tolerance)
      if (!success) {
        return {
          success: false,
          stars: 0,
          message: '角色还没有走到目标点，再调整一下移动路线。'
        }
      }

      if (evaluation.requiredIfElseBlocks && (counts.if_else || 0) < evaluation.requiredIfElseBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.ifElseHint || '这关要先用“如果否则”做判断，再决定怎么走。'
        }
      }

      if (evaluation.requiredPathCheckBlocks && (counts.path_clear || 0) < evaluation.requiredPathCheckBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.pathCheckHint || '把“方向能走”积木接进条件里，让程序真的先判断再行动。'
        }
      }

      if (evaluation.requiredRepeatUntilBlocks && (counts.repeat_until || 0) < evaluation.requiredRepeatUntilBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.repeatUntilHint || '这关要用“重复直到”，让程序自己决定什么时候停下。'
        }
      }

      if (evaluation.requiredTouchingBlocks && (counts.touching_obstacle || 0) < evaluation.requiredTouchingBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.touchingHint || '把“碰到障碍物”接进条件里，程序才是在用碰撞侦测做判断。'
        }
      }

      if (evaluation.requiredWaitBlocks && (counts.wait_seconds || 0) < evaluation.requiredWaitBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.waitHint || '这关要先等待一下，再让程序继续执行后面的动作。'
        }
      }

      if (evaluation.requiredSwitchBlocks && (counts.switch_signal || 0) < evaluation.requiredSwitchBlocks) {
        return {
          success: false,
          stars: 0,
          message: evaluation.switchHint || '这关要用“根据当前信号选择”积木。'
        }
      }

      const movementCount =
        (counts.move_up || 0) +
        (counts.move_down || 0) +
        (counts.move_forward || 0) +
        (counts.move_backward || 0) +
        (counts.move_left || 0) +
        (counts.move_right || 0) +
        (counts.move_steps || 0)
      const precise =
        evaluation.requiredIfElseBlocks ||
        evaluation.requiredSwitchBlocks ||
        evaluation.requiredRepeatUntilBlocks ||
        evaluation.requiredWaitBlocks
          ? true
          : caseInfo.id === 4
            ? (counts.goto_xy || 0) >= 1
            : movementCount <= 6

      let message = evaluation.successMessage
      if (!message && evaluation.requiredSwitchBlocks) {
        message = currentSignal ? `你已经根据 ${currentSignal} 信号选对了分支，顺利到达目标。` : '你已经用分支结构走到了正确目标。'
      }
      if (!message && evaluation.requiredIfElseBlocks) {
        message = '你已经让程序先判断再行动，成功绕开障碍到达终点。'
      }
      if (!message) {
        message = precise ? '你成功完成目标，而且路线也很利落。' : '已经到达目标了，再让路线更简洁一点会更棒。'
      }

      return {
        success: true,
        stars: precise ? 3 : 2,
        message
      }
    }
    case 'collect-stars': {
      const success = runMetrics.collectedStars.size === caseInfo.stage.stars.length
      if (!success) {
        return {
          success: false,
          stars: 0,
          message: `已经收集 ${runMetrics.collectedStars.size} 颗星星，把剩下的也碰到就通关了。`
        }
      }

      if (evaluation.requiredRepeatBlocks && repeatMetrics.total < evaluation.requiredRepeatBlocks) {
        return {
          success: false,
          stars: 0,
          message:
            evaluation.repeatHint || `这关至少要用 ${evaluation.requiredRepeatBlocks} 个“重复”积木，把重复动作写得更像程序。`
        }
      }

      if (evaluation.requiredNestedRepeatDepth && repeatMetrics.maxDepth < evaluation.requiredNestedRepeatDepth) {
        return {
          success: false,
          stars: 0,
          message:
            evaluation.nestedRepeatHint ||
            `这关需要把“重复”积木嵌套起来，至少做到 ${evaluation.requiredNestedRepeatDepth} 层。`
        }
      }

      const usedTurn = (counts.turn_left || 0) + (counts.turn_right || 0) >= 1
      let message = '星星已经全部收集完了。'
      if (evaluation.requiredNestedRepeatDepth) {
        message = `你已经用嵌套循环把路线整理成程序了，${caseInfo.stage.stars.length} 颗星星全部到手。`
      } else if (evaluation.requiredRepeatBlocks) {
        message = `你用重复把整段路线整理好了，${caseInfo.stage.stars.length} 颗星星都收到了。`
      } else if (usedTurn) {
        message = '三颗星星都收到了，而且路线设计得很不错。'
      } else {
        message = '三颗星星都拿到了，再试试加入转向让路线更聪明。'
      }

      return {
        success: true,
        stars: evaluation.requiredRepeatBlocks ? 3 : usedTurn ? 3 : 2,
        message
      }
    }
    case 'avoid-obstacle': {
      return evaluateAvoidObstacleResult(caseInfo, counts, runMetrics)
    }
    case 'square-path': {
      const startPoint = activeCase.value.stage.start
      const backToStart = distanceBetween(getCharacterCenter(startPoint.x, startPoint.y), getCharacterCenter()) <= evaluation.maxDistanceToStart
      const success = runMetrics.totalDistance >= evaluation.minDistance && backToStart
      if (!success) {
        return {
          success: false,
          stars: 0,
          message: '还没有完整走出一圈，尽量让角色回到起点附近。'
        }
      }

      const usedRepeat = (counts.repeat || 0) >= 1
      return {
        success: true,
        stars: usedRepeat ? 3 : 2,
        message: usedRepeat ? '角色已经绕了一圈，而且你用到了重复积木。' : '路线已经成功走出来了，再试试用重复让程序更短。'
      }
    }
    default:
      return {
        success: true,
        stars: 2,
        message: '程序运行完成。'
      }
  }
}

const goToLevels = () => {
  router.push('/levels')
}

const goToProgress = () => {
  router.push(isParentAccount.value ? '/parent-progress' : '/progress')
}

const goToNextCase = () => {
  if (!nextCase.value) {
    return
  }

  selectedCaseId.value = nextCase.value.id
  handleCaseChange(nextCase.value.id)
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

const handleCaseChange = (caseId) => {
  const targetCase = caseStore.getCaseById(caseId)
  const targetCaseId = targetCase?.id || getFirstUnlockedCaseId()
  const accessibleCaseId = resolveAccessibleCaseId(targetCaseId)

  if (accessibleCaseId !== targetCaseId) {
    ElMessage.warning('先完成前一关，新的关卡就会解锁。')
    selectedCaseId.value = activeCase.value.id
    return
  }

  persistDraft()
  selectedCaseId.value = accessibleCaseId
  updateRouteCase(accessibleCaseId)

  if (workspace) {
    loadCurrentCase({ restoreRuntimeState: false })
  }
}

const runProgram = async () => {
  if (!workspace || !characterEngine.value) {
    return
  }

  running.value = true
  resetForRun()
  resultMessage.value = '角色出发了，请看右边舞台。'

  try {
    const errors = BlockExecutor.validateBlocks(workspace)
    if (errors.length > 0) {
      const message = errors.join('；')
      ElMessage.warning(message)
      resultMessage.value = message
      lastResult.value = {
        attempted: true,
        success: false,
        stars: 0
      }
      return
    }

    await BlockExecutor.executeWorkspace(workspace, characterEngine.value)

    const result = evaluateMissionResult()
    resultMessage.value = result.message
    lastResult.value = {
      attempted: true,
      success: result.success,
      stars: result.stars
    }

    if (result.success) {
      const completion = progressStore.markCaseCompleted(activeCase.value, result.stars)

      if (completion.firstCompletion || completion.starsImproved) {
        await progressStore.syncCompletionToBackend(userStore.getUserId, activeCase.value.id, result.stars)
      }

      ElMessage.success(`通关成功，获得 ${result.stars} 颗星星。`)
    } else {
      ElMessage.warning('这次还差一点，改一改再试。')
    }

    persistDraft()
  } catch (error) {
    console.error('程序执行错误:', error)
    resultMessage.value = '程序运行出错了，请检查积木连接。'
    lastResult.value = {
      attempted: true,
      success: false,
      stars: 0
    }
    ElMessage.error(error.message || '程序运行出错')
  } finally {
    running.value = false
  }
}

const resetProgram = () => {
  applyCaseDefaults(activeCase.value, {
    preserveCharacter: true,
    preserveBackground: true
  })
  persistDraft()
  ElMessage.success('角色已经回到本关起点。')
}

const clearWorkspace = async () => {
  if (!workspace) {
    return
  }

  try {
    await ElMessageBox.confirm('确定重新拼这关吗？已经放好的积木会回到关卡默认样子。', '重新开始', {
      type: 'warning'
    })

    loadCaseWorkspace(activeCase.value)
    persistDraft()
    ElMessage.success('工作区已经恢复成这一关的默认积木。')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空工作区失败:', error)
    }
  }
}

const zoomIn = () => {
  if (workspace) {
    BlockUtils.zoomWorkspace(workspace, 1)
    syncBlockScaleFromWorkspace()
  }
}

const zoomOut = () => {
  if (workspace) {
    BlockUtils.zoomWorkspace(workspace, -1)
    syncBlockScaleFromWorkspace()
  }
}

const zoomInMap = () => {
  mapZoom.value = Math.min(2, Number((mapZoom.value + 0.2).toFixed(2)))
}

const zoomOutMap = () => {
  mapZoom.value = Math.max(0.8, Number((mapZoom.value - 0.2).toFixed(2)))
}

const resetMapZoom = () => {
  mapZoom.value = 1
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const saveWork = () => {
  dialogVisible.value = true
}

const confirmSave = async () => {
  const finalName = workName.value.trim() || `${activeCase.value.shortTitle} 作品`
  workName.value = finalName

  const payload = buildWorkPayload()
  if (!payload) {
    return
  }

  localStorage.setItem(getSnapshotStorageKey(activeCase.value.id), JSON.stringify(payload))
  localStorage.setItem(getDraftStorageKey(activeCase.value.id), JSON.stringify(payload))

  if (userStore.getUserId) {
    try {
      await saveLearningRecord({
        userId: userStore.getUserId,
        caseId: activeCase.value.id,
        workName: finalName,
        workspaceXml: payload.xml,
        workspaceJson: JSON.stringify(payload),
        result: lastResult.value.success ? '成功完成关卡' : '收藏作品',
        screenshot: null,
        duration: 0,
        stars: currentCaseStars.value || lastResult.value.stars || 0,
        status: 0,
        likes: 0
      })
      await loadRemoteWorkPayloads()
      dialogVisible.value = false
      markSaved('已收藏到账号')
      ElMessage.success(`作品《${finalName}》已经保存到当前账号。`)
      return
    } catch (error) {
      console.error('保存账号作品失败:', error)
      return
    }
  }

  dialogVisible.value = false
  markSaved('已收藏作品')
  ElMessage.success(`作品《${finalName}》已经保存到本地。`)
}

watch([helperPanelWidth, codePanelWidth, previewPanelWidth], () => {
  normalizePanelWidths()
  normalizeMapFrameSize()
  persistUiSetting('kid-lab:helper-panel-width', helperPanelWidth.value)
  persistUiSetting('kid-lab:code-panel-width', codePanelWidth.value)
  persistUiSetting('kid-lab:preview-panel-width', previewPanelWidth.value)
  queueWorkspaceResize()
})

watch(blockScalePercent, (value) => {
  persistUiSetting('kid-lab:block-scale', value)
  applyBlocklyScale()
})

watch(codePanelCollapsed, (collapsed) => {
  persistUiSetting('kid-lab:code-panel-collapsed', collapsed ? 1 : 0)
  queueWorkspaceResize()
})

watch(mapFrameSize, (value) => {
  persistUiSetting('kid-lab:map-frame-size', Math.round(value))
})

watch(
  () => route.query.caseId,
  (value) => {
    const nextCaseId = resolveAccessibleCaseId(Number(value) || 1)

    if (nextCaseId !== selectedCaseId.value) {
      persistDraft()
      selectedCaseId.value = nextCaseId
      if (workspace) {
        loadCurrentCase({ restoreRuntimeState: false })
      }
    }

    updateRouteCase(nextCaseId)
  }
)

watch(
  () => ({
    ...characterProps.value
  }),
  (props) => {
    applyStoreStateToCharacter(props)
  },
  {
    immediate: true
  }
)

watch(
  () => [backgroundStore.currentBackground, currentCharacter.value],
  () => {
    persistDraft()
  }
)

onMounted(async () => {
  await caseStore.fetchCases()
  await syncProgressFromBackend()
  await loadRemoteWorkPayloads()
  initializeEngine()
  initializeBlockly()
  nextTick(() => {
    bindLayoutResizeObserver()
    normalizePanelWidths()
    normalizeMapFrameSize()
    queueWorkspaceResize()
  })
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  hideSpeech()
  stopResize()
  stopMapResize()
  unbindLayoutResizeObserver()
  window.removeEventListener('resize', handleWindowResize)
  if (typeof window !== 'undefined') {
    window.clearTimeout(workspaceResizeTimer)
  }

  if (workspace) {
    workspace.dispose()
    workspace = null
  }
})
</script>

<style scoped>
.lab-page {
  min-height: 100vh;
  padding: 18px;
  color: #22324c;
  background:
    radial-gradient(circle at top left, rgba(255, 204, 112, 0.18), transparent 18%),
    radial-gradient(circle at top right, rgba(100, 176, 255, 0.16), transparent 18%),
    linear-gradient(180deg, #fff9ef 0%, #edf6ff 45%, #f7fbff 100%);
}

.lab-header,
.mission-banner,
.helper-card,
.editor-panel,
.preview-panel,
.info-card,
.meta-card,
.mission-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(34, 50, 76, 0.08);
  box-shadow: 0 18px 34px rgba(45, 70, 112, 0.08);
}

.lab-header {
  max-width: 1380px;
  margin: 0 auto 14px;
  padding: 18px 20px;
  border-radius: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-main,
.title-group,
.header-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-group {
  align-items: flex-start;
}

.back-button {
  flex-shrink: 0;
}

.difficulty-pill,
.section-label {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: #fff0d2;
  color: #a46b00;
  font-size: 12px;
  font-weight: 700;
}

.title-group h1 {
  margin: 2px 0 4px;
  font-size: 28px;
}

.title-group p {
  margin: 0;
  color: #6b7c96;
  font-size: 14px;
  line-height: 1.7;
}

.header-meta {
  flex-wrap: wrap;
  justify-content: flex-end;
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

.meta-card {
  min-width: 170px;
  padding: 12px 14px;
  border-radius: 18px;
}

.meta-card span,
.mission-card span,
.editor-footer span,
.save-dialog-tip {
  display: block;
  color: #70819c;
  font-size: 12px;
}

.meta-card strong,
.mission-card strong {
  display: block;
  margin-top: 6px;
  font-size: 16px;
  line-height: 1.5;
}

.mission-banner {
  max-width: 1380px;
  margin: 0 auto 14px;
  padding: 18px;
  border-radius: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 14px;
}

.mission-copy h2 {
  margin: 12px 0 8px;
  font-size: 30px;
}

.mission-copy p,
.mission-card li,
.guide-item p,
.feedback-card p,
.info-card p,
.save-dialog-tip {
  margin: 0;
  color: #6b7c96;
  line-height: 1.8;
}

.mission-side {
  display: grid;
  gap: 12px;
}

.mission-card {
  padding: 14px 16px;
  border-radius: 20px;
}

.focus-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.focus-tags strong {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef5ff;
  color: #346198;
  font-size: 13px;
  font-weight: 700;
}

.mission-card ol {
  margin: 10px 0 0;
  padding-left: 18px;
}

.workspace {
  max-width: 1380px;
  margin: 0 auto;
  display: grid;
  grid-template-columns:
    var(--helper-panel-width, 300px)
    var(--panel-divider-width, 18px)
    minmax(460px, 1fr)
    var(--panel-divider-width, 18px)
    var(--preview-panel-width, 380px);
  gap: 14px;
  min-height: calc(100vh - 210px);
}

.helper-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.helper-card,
.editor-panel,
.preview-panel,
.info-card {
  border-radius: 24px;
}

.helper-card {
  padding: 16px;
}

.feedback-card {
  overflow: hidden;
}

.feedback-card.idle {
  background: linear-gradient(180deg, rgba(255, 249, 232, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.feedback-card.running {
  background: linear-gradient(180deg, rgba(234, 244, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.feedback-card.success {
  background: linear-gradient(180deg, rgba(235, 250, 240, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.feedback-card.warning {
  background: linear-gradient(180deg, rgba(255, 241, 232, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.feedback-card h3 {
  margin: 12px 0 8px;
  font-size: 26px;
}

.reward-stars {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  font-size: 26px;
}

.reward-stars span {
  opacity: 0.32;
}

.reward-stars span.active {
  opacity: 1;
}

.guide-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.guide-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  background: #f7faff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.guide-item.active {
  background: #eef5ff;
  box-shadow: inset 0 0 0 1px rgba(76, 132, 211, 0.18);
  transform: translateY(-1px);
}

.guide-item strong {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffbc5b 0%, #ff9751 100%);
  color: white;
  font-size: 18px;
}

.guide-item h4 {
  margin: 2px 0 4px;
  font-size: 18px;
}

.editor-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-top {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(34, 50, 76, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
}

.case-picker {
  min-width: 240px;
}

.case-select {
  width: 100%;
  margin-top: 10px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.workspace-tip {
  padding: 12px 18px;
  border-bottom: 1px solid rgba(34, 50, 76, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fffaf0;
  color: #7a6230;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-toolbar {
  display: none;
  padding: 14px 18px 12px;
  border-bottom: 1px solid rgba(34, 50, 76, 0.08);
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.96) 0%, rgba(255, 255, 255, 0.92) 100%);
  gap: 12px;
}

.size-toolbar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.size-toolbar-head strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
}

.preset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-sliders {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
}

.size-item {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #52637f;
  font-weight: 700;
}

.panel-divider {
  align-self: stretch;
  width: var(--panel-divider-width, 18px);
  min-width: var(--panel-divider-width, 18px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: col-resize;
  touch-action: none;
}

.divider-grip {
  width: 8px;
  height: 84px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(78, 114, 167, 0.5) 1px, transparent 1px) center / 8px 12px,
    linear-gradient(180deg, rgba(232, 240, 255, 0.96) 0%, rgba(201, 218, 245, 0.98) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.92),
    0 10px 22px rgba(65, 94, 146, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.panel-divider:hover .divider-grip,
.panel-divider.active .divider-grip {
  transform: scaleX(1.12);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.96),
    0 12px 26px rgba(65, 94, 146, 0.2);
}

.editor-workbench {
  flex: 1;
  min-height: 0;
  display: grid;
  position: relative;
  grid-template-columns: minmax(0, 1fr) var(--code-divider-width, 18px) var(--code-panel-width, 320px);
}

.editor-workbench.code-collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.blockly-area {
  width: 100%;
  min-width: 0;
  min-height: var(--blockly-min-height, 520px);
}

.editor-workbench.code-collapsed .blockly-area {
  grid-column: 1 / -1;
}

.code-toggle-tab {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
  padding: 10px 12px;
  border: 1px solid rgba(54, 91, 143, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  color: #365b8f;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(45, 70, 112, 0.12);
}

.code-hide-button {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 4;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: rgba(15, 23, 39, 0.86);
  color: #f7f9ff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(8, 12, 21, 0.22);
}

.code-panel {
  border-left: 1px solid rgba(34, 50, 76, 0.08);
  background: linear-gradient(180deg, #0f1727 0%, #182235 100%);
  color: #f7f9ff;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.code-panel-head {
  padding: 16px;
  padding-right: 120px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.code-panel-head h4 {
  margin: 10px 0 0;
  font-size: 18px;
}

.code-hint {
  color: rgba(247, 249, 255, 0.64);
  font-size: 12px;
}

.code-actions-bar {
  display: none;
}

.code-preview {
  flex: 1;
  overflow: auto;
  padding: 10px 0;
}

.code-line {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 10px;
  align-items: start;
  padding: 5px 16px;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.8;
}

.line-number {
  color: rgba(247, 249, 255, 0.34);
  text-align: right;
  user-select: none;
}

.code-line code {
  color: #eef3ff;
  white-space: pre-wrap;
  word-break: break-word;
}

.editor-footer {
  padding: 12px 18px;
  border-top: 1px solid rgba(34, 50, 76, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.editor-footer strong {
  color: #365b8f;
  font-size: 13px;
}

.preview-panel {
  padding: 16px;
  overflow: hidden;
  min-width: 0;
}

.preview-header {
  margin-bottom: 12px;
}

.preview-header h3 {
  margin: 10px 0 0;
  font-size: 24px;
}

.preview-tools {
  display: grid;
  gap: 10px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.status-row span {
  padding: 7px 12px;
  border-radius: 999px;
  background: #f5f7fb;
  color: #52637f;
  font-size: 12px;
  font-weight: 700;
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  color: #52637f;
  font-size: 12px;
  font-weight: 700;
}

.map-shell {
  position: relative;
  display: inline-block;
  max-width: 100%;
  border-radius: 24px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  padding: 12px;
  border: 1px solid rgba(34, 50, 76, 0.08);
}

.map-viewport {
  overflow: auto;
  border-radius: 20px;
}

.map-canvas {
  width: 520px;
  height: 520px;
  transform-origin: top left;
}

.map-resize-handle {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: nwse-resize;
  touch-action: none;
}

.map-resize-handle span {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 16px;
  height: 16px;
  border-right: 3px solid rgba(54, 91, 143, 0.58);
  border-bottom: 3px solid rgba(54, 91, 143, 0.58);
  border-radius: 0 0 8px 0;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.map-resize-handle:hover span {
  transform: scale(1.08);
  border-right-color: rgba(54, 91, 143, 0.84);
  border-bottom-color: rgba(54, 91, 143, 0.84);
}

.stage {
  position: relative;
  width: 520px;
  height: 520px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.8;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(34, 50, 76, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(34, 50, 76, 0.08) 1px, transparent 1px),
    linear-gradient(to right, rgba(34, 50, 76, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(34, 50, 76, 0.22) 1px, transparent 1px);
  background-size:
    calc(100% / 100) calc(100% / 100),
    calc(100% / 100) calc(100% / 100),
    calc(100% / 10) calc(100% / 10),
    calc(100% / 10) calc(100% / 10);
}

.grid-overlay.hidden {
  display: none;
}

.axis {
  position: absolute;
  background: rgba(17, 29, 48, 0.7);
  pointer-events: none;
  z-index: 1;
}

.axis-x {
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
}

.axis-y {
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
}

.axis-title {
  position: absolute;
  z-index: 2;
  color: rgba(17, 29, 48, 0.76);
  font-size: 12px;
  font-weight: 800;
}

.axis-title-x {
  top: 8px;
  right: 10px;
}

.axis-title-y {
  top: 10px;
  left: 8px;
}

.tick-label {
  position: absolute;
  z-index: 2;
  color: rgba(17, 29, 48, 0.62);
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
}

.tick-label.top {
  top: 8px;
  transform: translateX(-50%);
}

.tick-label.left {
  left: 8px;
  transform: translateY(-50%);
}

.stage-target,
.stage-star,
.stage-obstacle,
.guide-point {
  position: absolute;
  z-index: 2;
}

.stage-target,
.stage-star,
.character {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stage-target,
.stage-star {
  transform: translate(-50%, -50%);
}

.stage-target span,
.stage-star span {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-size: 28px;
}

.stage-target small,
.stage-star small,
.stage-obstacle small,
.guide-point small,
.character small {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #32425e;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.stage-star {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.stage-star.collected {
  opacity: 0.32;
  transform: translate(-50%, -50%) scale(1.1);
}

.stage-obstacle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  border-radius: 14px;
  background: rgba(255, 107, 107, 0.86);
  color: white;
  font-size: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.stage-obstacle.is-line {
  overflow: visible;
  background: transparent;
  border: none;
}

.stage-obstacle.is-line span {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -120%);
  font-size: 20px;
  line-height: 1;
}

.stage-obstacle-line {
  position: absolute;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 107, 107, 0.96) 0%, rgba(226, 62, 62, 0.96) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.72),
    0 8px 18px rgba(196, 67, 67, 0.22);
  transform-origin: center;
}

.stage-obstacle.is-line small {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, calc(100% + 6px));
}

.stage-obstacle.hit {
  box-shadow: 0 0 0 3px rgba(255, 244, 145, 0.9);
}

.guide-point {
  transform: translate(-50%, -50%);
}

.guide-point::before {
  content: '';
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(72, 125, 196, 0.18);
}

.character {
  position: absolute;
  z-index: 3;
  transition: left 0.12s linear, top 0.12s linear, transform 0.18s ease;
  overflow: visible;
}

.character-body {
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.direction-arrow {
  position: absolute;
  z-index: 1;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 16px rgba(45, 70, 112, 0.14);
  color: #365b8f;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}

.character img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 12px rgba(35, 50, 76, 0.14));
}

.speech-bubble {
  position: absolute;
  z-index: 4;
  max-width: 160px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  color: #42536f;
  font-size: 13px;
  line-height: 1.5;
}

.info-list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.info-card {
  padding: 14px;
}

.info-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
}

.info-card :deep(.el-button) {
  margin-top: 10px;
}

:deep(.character-panel),
:deep(.background-selector) {
  width: 100%;
  border: 1px solid rgba(35, 50, 76, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

:deep(.blocklyToolboxDiv) {
  background: #fffdf6;
  border-right: 1px solid rgba(34, 50, 76, 0.08);
}

:deep(.blocklyTreeRow) {
  height: 44px;
  margin: 6px 8px;
  border-radius: 14px;
}

:deep(.blocklyFlyout) {
  fill: #fffdf7 !important;
}

:deep(.blocklyZoom > image),
:deep(.blocklyTrash > image) {
  transform: scale(1.08);
  transform-origin: center;
}

@media (max-width: 1300px) {
  .workspace {
    grid-template-columns: var(--helper-panel-width, 280px) var(--panel-divider-width, 18px) 1fr;
    grid-template-rows: auto auto;
  }

  .preview-divider {
    display: none;
  }

  .preview-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 980px) {
  .lab-header,
  .mission-banner,
  .workspace {
    grid-template-columns: 1fr;
  }

  .lab-header,
  .header-main,
  .header-meta,
  .header-actions,
  .editor-top,
  .size-toolbar-head,
  .workspace-tip,
  .editor-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .user-pill {
    justify-content: center;
  }

  .workspace {
    display: grid;
    grid-template-columns: 1fr;
  }

  .panel-divider {
    display: none;
  }

  .editor-workbench {
    grid-template-columns: 1fr;
  }

  .size-sliders {
    grid-template-columns: 1fr;
  }

  .code-panel {
    border-left: none;
    border-top: 1px solid rgba(34, 50, 76, 0.08);
  }
}

@media (max-width: 720px) {
  .lab-page {
    padding: 12px;
  }

  .mission-banner {
    padding: 14px;
  }

  .action-bar {
    justify-content: stretch;
  }

  .action-bar :deep(.el-button) {
    width: 100%;
  }

  .blockly-area {
    min-height: 420px;
  }

  .map-canvas,
  .stage {
    width: 460px;
    height: 460px;
  }
}
</style>
