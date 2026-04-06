<template>
  <div class="character-panel">
    <div class="panel-header">
      <div>
        <span class="panel-kicker">舞台角色</span>
        <h3>{{ currentCharacterLabel }}</h3>
      </div>
      <span class="panel-meta">{{ characters.length }} 个角色</span>
    </div>

    <div class="character-grid">
      <button
        v-for="char in characters"
        :key="char.id"
        type="button"
        class="character-item"
        :class="{ active: currentCharacter === char.id }"
        @click="selectCharacter(char.id)"
      >
        <span class="character-icon">
          <img :src="char.image" :alt="char.name" />
        </span>
        <span class="character-name">{{ char.name }}</span>
      </button>
    </div>

    <div class="status-block">
      <div class="status-row">
        <span>位置</span>
        <strong>({{ roundedX }}, {{ roundedY }})</strong>
      </div>
      <div class="status-row">
        <span>方向</span>
        <strong>{{ directionLabel }}</strong>
      </div>
      <el-button plain class="reset-button" @click="resetCharacter">回到本关起点</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '@/store/character'
import { getDirectionMeta } from '@/utils/direction'

const characterStore = useCharacterStore()
const { characters, currentCharacter, characterProps } = storeToRefs(characterStore)

const currentCharacterLabel = computed(() => {
  return characters.value.find((item) => item.id === currentCharacter.value)?.name || '角色'
})

const roundedX = computed(() => Math.round(characterProps.value.x))
const roundedY = computed(() => Math.round(characterProps.value.y))
const directionLabel = computed(() => {
  const meta = getDirectionMeta(characterProps.value.direction)
  return `${meta.arrow} ${meta.label}`
})

const selectCharacter = (characterId) => {
  characterStore.setCharacter(characterId)
}

const resetCharacter = () => {
  characterStore.resetCharacter()
}
</script>

<style scoped>
.character-panel {
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.panel-header {
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

.panel-header h3 {
  margin: 6px 0 0;
  font-size: 20px;
  color: var(--app-text);
}

.character-grid {
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.character-item {
  padding: 12px 10px;
  border: 1px solid rgba(35, 50, 76, 0.08);
  border-radius: 16px;
  background: #fbfcff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.character-item:hover {
  transform: translateY(-1px);
  border-color: rgba(74, 127, 200, 0.35);
}

.character-item.active {
  background: #f4f8ff;
  border-color: #4a7fc8;
}

.character-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
}

.character-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.character-name {
  color: var(--app-text);
  font-size: 13px;
}

.status-block {
  padding: 16px;
  border-top: 1px solid rgba(35, 50, 76, 0.08);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(35, 50, 76, 0.08);
  color: var(--app-text-soft);
  font-size: 13px;
}

.status-row strong {
  color: var(--app-text);
  font-size: 14px;
}

.reset-button {
  width: 100%;
}
</style>
