<template>
  <div class="background-selector">
    <div class="selector-header">
      <div>
        <span class="panel-kicker">舞台背景</span>
        <h3>{{ currentBackgroundLabel }}</h3>
      </div>
      <span class="panel-meta">{{ backgrounds.length }} 个场景</span>
    </div>

    <div class="background-grid">
      <button
        v-for="bg in backgrounds"
        :key="bg.id"
        type="button"
        class="background-item"
        :class="{ active: currentBackground === bg.id }"
        @click="selectBackground(bg.id)"
      >
        <span class="background-preview" :style="{ background: bg.color }">
          <span class="background-emoji">{{ bg.emoji }}</span>
        </span>
        <span class="background-name">{{ bg.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBackgroundStore } from '@/store/background'

const backgroundStore = useBackgroundStore()
const { backgrounds, currentBackground } = storeToRefs(backgroundStore)

const currentBackgroundLabel = computed(() => {
  return backgroundStore.getCurrentBackground?.name || '默认'
})

const selectBackground = (backgroundId) => {
  backgroundStore.setBackground(backgroundId)
}
</script>

<style scoped>
.background-selector {
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.selector-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid rgba(35, 50, 76, 0.08);
}

.panel-kicker,
.panel-meta {
  font-size: 12px;
  color: var(--app-text-soft);
}

.selector-header h3 {
  margin: 6px 0 0;
  font-size: 20px;
  color: var(--app-text);
}

.background-grid {
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.background-item {
  border: 1px solid rgba(35, 50, 76, 0.08);
  border-radius: 16px;
  background: #fbfcff;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.background-item:hover {
  transform: translateY(-1px);
  border-color: rgba(74, 127, 200, 0.35);
}

.background-item.active {
  background: #f4f8ff;
  border-color: #4a7fc8;
}

.background-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 84px;
}

.background-emoji {
  font-size: 34px;
}

.background-name {
  display: block;
  padding: 9px 10px 12px;
  color: var(--app-text);
  font-size: 13px;
  text-align: center;
}
</style>
