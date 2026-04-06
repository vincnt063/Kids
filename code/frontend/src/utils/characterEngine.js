const DEFAULT_MOVE_DISTANCE = 10
const CHARACTER_SIZE = 12
const WORLD_SIZE = 100
const FRAME_DISTANCE = 1
const FRAME_DELAY = 24
const TURN_DELAY = 120
const SHORT_DELAY = 90
const SPEECH_DELAY = 320
const REPEAT_UNTIL_LIMIT = 24

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

export class CharacterState {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = 50
    this.y = 200
    this.direction = 0
    this.size = 100
    this.visible = true
  }
}

export class ExecutionEngine {
  constructor(characterState, callbacks = {}) {
    this.state = characterState
    this.callbacks = callbacks
    this.isRunning = false
  }

  async executeWorkspace(workspace) {
    const startBlock = workspace.getTopBlocks(true).find(block => block.type === 'event_start')

    this.isRunning = true

    try {
      if (startBlock?.getNextBlock()) {
        await this.executeSequence(startBlock.getNextBlock())
      }

      return true
    } finally {
      this.isRunning = false
    }
  }

  stop() {
    this.isRunning = false
  }

  async executeSequence(block) {
    let currentBlock = block

    while (currentBlock && this.isRunning) {
      await this.executeBlock(currentBlock)
      currentBlock = currentBlock.getNextBlock()
    }
  }

  async executeBlock(block) {
    switch (block.type) {
      case 'move_up':
        await this.moveByDirection(this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE))
        break
      case 'move_down':
        await this.moveByDirection(-this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE))
        break
      case 'move_forward':
        await this.moveByDirection(this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE))
        break
      case 'move_backward':
        await this.moveByDirection(-this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE))
        break
      case 'move_left':
        await this.moveByDirection(this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE), -1)
        break
      case 'move_right':
        await this.moveByDirection(this.getMoveDistance(block, DEFAULT_MOVE_DISTANCE), 1)
        break
      case 'move_steps':
        await this.moveByDirection(this.getNumberInput(block, 'STEPS', DEFAULT_MOVE_DISTANCE))
        break
      case 'move_to':
      case 'goto_xy':
        await this.animateTo(
          this.getNumberInput(block, 'X', 200),
          this.getNumberInput(block, 'Y', 120)
        )
        break
      case 'turn_left':
        await this.turn(-1)
        break
      case 'turn_right':
        await this.turn(1)
        break
      case 'set_direction':
        await this.setDirection(this.getNumberInput(block, 'DIRECTION', 0))
        break
      case 'change_x':
        await this.animateTo(this.state.x + this.getNumberInput(block, 'DX', 0), this.state.y)
        break
      case 'change_y':
        await this.animateTo(this.state.x, this.state.y + this.getNumberInput(block, 'DY', 0))
        break
      case 'set_x':
        await this.animateTo(this.getNumberInput(block, 'X', this.state.x), this.state.y)
        break
      case 'set_y':
        await this.animateTo(this.state.x, this.getNumberInput(block, 'Y', this.state.y))
        break
      case 'repeat':
        await this.repeat(
          this.getNumberInput(block, 'TIMES', 1),
          block.getInputTargetBlock('DO')
        )
        break
      case 'repeat_until':
        await this.repeatUntil(
          block.getInputTargetBlock('CONDITION'),
          block.getInputTargetBlock('DO')
        )
        break
      case 'if_then':
        await this.ifThen(
          this.getInputValue(block, 'CONDITION', true),
          block.getInputTargetBlock('DO')
        )
        break
      case 'if_else':
        await this.ifElse(
          this.getInputValue(block, 'CONDITION', true),
          block.getInputTargetBlock('DO'),
          block.getInputTargetBlock('ELSE')
        )
        break
      case 'switch_signal':
        await this.switchSignal(block)
        break
      case 'wait_seconds':
        await this.waitSeconds(this.getNumberInput(block, 'SECONDS', 1))
        break
      case 'say':
        this.say(this.getTextInput(block, 'MESSAGE', '你好，我会编程'))
        await this.pause(SPEECH_DELAY)
        break
      case 'show':
        this.setVisible(true)
        await this.pause(SHORT_DELAY)
        break
      case 'hide':
        this.setVisible(false)
        await this.pause(SHORT_DELAY)
        break
      case 'bounce_edge':
        await this.bounceEdge()
        break
      default:
        console.warn('未支持的积木类型:', block.type)
        break
    }
  }

  getInputValue(block, inputName, fallback) {
    const inputBlock = block.getInputTargetBlock(inputName)
    return this.evaluateValueBlock(inputBlock, fallback)
  }

  evaluateValueBlock(block, fallback) {
    if (!block) {
      return fallback
    }

    if (block.type === 'math_number') {
      return this.toNumber(block.getFieldValue('NUM'), fallback)
    }

    if (block.type === 'text' || block.type === 'text_multiline') {
      return block.getFieldValue('TEXT') || fallback
    }

    if (block.type === 'logic_boolean') {
      return block.getFieldValue('BOOL') === 'TRUE'
    }

    if (block.type === 'path_clear') {
      return this.isPathClear(
        block.getFieldValue('DIRECTION') || 'forward',
        this.getNumberInput(block, 'STEPS', DEFAULT_MOVE_DISTANCE)
      )
    }

    if (block.type === 'touching_obstacle') {
      return this.isTouchingObstacle()
    }

    const numberField = block.getFieldValue('NUM')
    if (numberField !== null && numberField !== undefined) {
      return this.toNumber(numberField, fallback)
    }

    const textField = block.getFieldValue('TEXT')
    if (textField !== null && textField !== undefined) {
      return textField
    }

    return fallback
  }

  getNumberInput(block, inputName, fallback) {
    return this.toNumber(this.getInputValue(block, inputName, fallback), fallback)
  }

  getMoveDistance(block, fallback) {
    const fieldValue = block?.getFieldValue?.('STEPS')
    return this.toNumber(fieldValue, fallback)
  }

  getTextInput(block, inputName, fallback) {
    const value = this.getInputValue(block, inputName, fallback)
    return value === null || value === undefined ? fallback : String(value)
  }

  toNumber(value, fallback = 0) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
  }

  toBoolean(value) {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'number') {
      return value !== 0
    }

    return Boolean(value)
  }

  async pause(duration) {
    if (!this.isRunning) {
      return
    }

    await new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  }

  async waitSeconds(seconds) {
    const duration = Math.max(0, this.toNumber(seconds, 1)) * 1000
    await this.pause(duration)

    if (this.callbacks.onWait) {
      this.callbacks.onWait(duration)
    }
  }

  getStageBounds() {
    const defaultBounds = { width: WORLD_SIZE, height: WORLD_SIZE }

    if (typeof this.callbacks.getStageBounds !== 'function') {
      return defaultBounds
    }

    const bounds = this.callbacks.getStageBounds() || defaultBounds
    return {
      width: Number(bounds.width) || defaultBounds.width,
      height: Number(bounds.height) || defaultBounds.height
    }
  }

  getStageObstacles() {
    if (typeof this.callbacks.getStageObstacles !== 'function') {
      return []
    }

    return this.callbacks.getStageObstacles() || []
  }

  getStageSignal() {
    if (typeof this.callbacks.getStageSignal !== 'function') {
      return ''
    }

    return this.normalizeSignal(this.callbacks.getStageSignal())
  }

  getCharacterSize() {
    return Math.max(6, CHARACTER_SIZE * (this.state.size / 100))
  }

  normalizeDirection(direction) {
    if (Math.abs(direction) >= 4 && direction % 90 === 0) {
      return ((Math.round(direction / 90) % 4) + 4) % 4
    }

    return ((Math.round(direction) % 4) + 4) % 4
  }

  clampPosition() {
    const { width, height } = this.getStageBounds()
    const size = this.getCharacterSize()

    this.state.x = Math.max(0, Math.min(width - size, this.state.x))
    this.state.y = Math.max(0, Math.min(height - size, this.state.y))
  }

  notifyMove() {
    this.clampPosition()

    if (this.callbacks.onMove) {
      this.callbacks.onMove(this.state.x, this.state.y)
    }
  }

  notifyTurn() {
    if (this.callbacks.onTurn) {
      this.callbacks.onTurn(this.state.direction)
    }
  }

  normalizeSignal(signal) {
    return String(signal || '').trim().toLowerCase()
  }

  setVisible(visible) {
    this.state.visible = visible

    if (this.callbacks.onShow) {
      this.callbacks.onShow(visible)
    }
  }

  say(message) {
    if (this.callbacks.onSay) {
      this.callbacks.onSay(message)
    }
  }

  getDirectionalTarget(distance, directionOffset = 0) {
    switch (this.normalizeDirection(this.state.direction + directionOffset)) {
      case 1:
        return { x: this.state.x, y: this.state.y + distance }
      case 2:
        return { x: this.state.x - distance, y: this.state.y }
      case 3:
        return { x: this.state.x, y: this.state.y - distance }
      case 0:
      default:
        return { x: this.state.x + distance, y: this.state.y }
    }
  }

  getAbsoluteTarget(direction, distance) {
    switch (direction) {
      case 'up':
        return { x: this.state.x, y: this.state.y - distance }
      case 'down':
        return { x: this.state.x, y: this.state.y + distance }
      case 'left':
        return { x: this.state.x - distance, y: this.state.y }
      case 'right':
      default:
        return { x: this.state.x + distance, y: this.state.y }
    }
  }

  getMovementTarget(direction, distance) {
    if (direction === 'forward') {
      return this.getDirectionalTarget(distance)
    }

    if (direction === 'backward') {
      return this.getDirectionalTarget(-distance)
    }

    if (direction === 'left') {
      return this.getDirectionalTarget(distance, -1)
    }

    if (direction === 'right') {
      return this.getDirectionalTarget(distance, 1)
    }

    return this.getAbsoluteTarget(direction, distance)
  }

  isRectangleInBounds(x, y) {
    const { width, height } = this.getStageBounds()
    const size = this.getCharacterSize()
    return x >= 0 && y >= 0 && x + size <= width && y + size <= height
  }

  intersectsObstacle(x, y) {
    const size = this.getCharacterSize()
    return this.getStageObstacles().some((obstacle) => isObstacleHit(x, y, size, obstacle))
  }

  isTouchingObstacle() {
    return this.intersectsObstacle(this.state.x, this.state.y)
  }

  isPathClear(direction, distance = DEFAULT_MOVE_DISTANCE) {
    const safeDistance = Math.max(0, Math.abs(this.toNumber(distance, DEFAULT_MOVE_DISTANCE)))
    const target = this.getMovementTarget(direction, safeDistance)
    const dx = target.x - this.state.x
    const dy = target.y - this.state.y
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))))

    for (let index = 1; index <= steps; index += 1) {
      const progress = index / steps
      const x = this.state.x + dx * progress
      const y = this.state.y + dy * progress

      if (!this.isRectangleInBounds(x, y) || this.intersectsObstacle(x, y)) {
        return false
      }
    }

    return true
  }

  async moveByDirection(distance, directionOffset = 0) {
    const target = this.getDirectionalTarget(distance, directionOffset)
    await this.animateTo(target.x, target.y)
  }

  async moveToOffset(dx, dy) {
    await this.animateTo(this.state.x + dx, this.state.y + dy)
  }

  async animateTo(targetX, targetY) {
    const startX = this.state.x
    const startY = this.state.y
    const dx = targetX - startX
    const dy = targetY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.max(1, Math.ceil(distance / FRAME_DISTANCE))

    for (let index = 1; index <= steps && this.isRunning; index += 1) {
      const progress = index / steps
      this.state.x = startX + dx * progress
      this.state.y = startY + dy * progress
      this.notifyMove()
      await this.pause(FRAME_DELAY)
    }

    if (this.callbacks.onMoveComplete) {
      this.callbacks.onMoveComplete(this.state.x, this.state.y)
    }
  }

  async turn(offset) {
    this.state.direction = this.normalizeDirection(this.state.direction + offset)
    this.notifyTurn()
    await this.pause(TURN_DELAY)
  }

  async setDirection(direction) {
    this.state.direction = this.normalizeDirection(direction)
    this.notifyTurn()
    await this.pause(TURN_DELAY)
  }

  async repeat(times, bodyBlock) {
    const loopTimes = Math.max(0, Math.floor(times))

    for (let index = 0; index < loopTimes && this.isRunning; index += 1) {
      if (bodyBlock) {
        await this.executeSequence(bodyBlock)
      }
    }
  }

  async repeatUntil(conditionBlock, bodyBlock) {
    if (!bodyBlock) {
      return
    }

    let iterations = 0

    while (this.isRunning && !this.toBoolean(this.evaluateValueBlock(conditionBlock, false))) {
      await this.executeSequence(bodyBlock)
      iterations += 1

      if (iterations >= REPEAT_UNTIL_LIMIT) {
        break
      }
    }
  }

  async ifThen(condition, bodyBlock) {
    if (this.toBoolean(condition) && bodyBlock) {
      await this.executeSequence(bodyBlock)
    }
  }

  async ifElse(condition, thenBlock, elseBlock) {
    if (this.toBoolean(condition)) {
      if (thenBlock) {
        await this.executeSequence(thenBlock)
      }
      return
    }

    if (elseBlock) {
      await this.executeSequence(elseBlock)
    }
  }

  async switchSignal(block) {
    const signal = this.getStageSignal()
    const branchMap = {
      red: 'RED',
      blue: 'BLUE',
      green: 'GREEN'
    }
    const branch = block.getInputTargetBlock(branchMap[signal] || '')

    if (branch) {
      await this.executeSequence(branch)
    }
  }

  async bounceEdge() {
    const { width, height } = this.getStageBounds()
    const size = this.getCharacterSize()
    let bounced = false

    if (this.state.x <= 0 || this.state.x >= width - size) {
      this.state.direction = this.normalizeDirection(2 - this.state.direction)
      bounced = true
    }

    if (this.state.y <= 0 || this.state.y >= height - size) {
      this.state.direction = this.normalizeDirection(4 - this.state.direction)
      bounced = true
    }

    this.notifyMove()

    if (bounced) {
      this.notifyTurn()
      this.say('碰到边缘了')
    }

    await this.pause(TURN_DELAY)
  }
}
