const DIRECTION_META = Object.freeze([
  { label: '朝右', shortLabel: '右', arrow: '→' },
  { label: '朝下', shortLabel: '下', arrow: '↓' },
  { label: '朝左', shortLabel: '左', arrow: '←' },
  { label: '朝上', shortLabel: '上', arrow: '↑' }
])

export const normalizeDirection = (direction = 0) => {
  return ((Math.round(Number(direction) || 0) % 4) + 4) % 4
}

export const getDirectionMeta = (direction = 0) => {
  return DIRECTION_META[normalizeDirection(direction)]
}
