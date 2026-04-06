import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const frontendRequire = createRequire(new URL('../frontend/package.json', import.meta.url))
const Blockly = frontendRequire('blockly/node')

const MAP_ICON_SIZE = 6
const CHARACTER_SIZE = 12
const WORLD_SIZE = 100

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

const hasObstacleDefinition = (obstacle) => {
  if (isLineObstacle(obstacle)) {
    return [obstacle.x1, obstacle.y1, obstacle.x2, obstacle.y2].every((value) => Number.isFinite(Number(value)))
  }

  return [obstacle.x, obstacle.y, obstacle.width, obstacle.height].every((value) => Number.isFinite(Number(value)))
}

const loadTeachingCases = () => {
  const casesDir = path.resolve(import.meta.dirname, '../frontend/src/data/teaching-cases')
  const levelDirs = fs.readdirSync(casesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('level-'))
    .filter((entry) => fs.existsSync(path.join(casesDir, entry.name, 'index.js')))
    .map((entry) => entry.name)
    .sort()

  return levelDirs.map((directoryName) => {
    const filePath = path.join(casesDir, directoryName, 'index.js')
    const source = fs.readFileSync(filePath, 'utf8')
    const transformed = source.replace(/export default\s+([A-Za-z0-9_]+)\s*$/, 'return $1')
    return new Function(`${transformed}`)()
  })
}

const teachingCases = loadTeachingCases()

Blockly.defineBlocksWithJsonArray([
  { type: 'event_start', message0: 'start', nextStatement: null, colour: 60 },
  {
    type: 'move_up',
    message0: 'forward %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_down',
    message0: 'backward %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_forward',
    message0: 'move %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_backward',
    message0: 'back %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_left',
    message0: 'left move %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_right',
    message0: 'right move %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  { type: 'turn_left', message0: 'left', previousStatement: null, nextStatement: null, colour: 210 },
  { type: 'turn_right', message0: 'right', previousStatement: null, nextStatement: null, colour: 210 },
  {
    type: 'goto_xy',
    message0: 'goto x %1 y %2',
    args0: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 90
  },
  {
    type: 'repeat',
    message0: 'repeat %1',
    args0: [{ type: 'input_value', name: 'TIMES', check: 'Number' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'repeat_until',
    message0: 'repeat until %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'if_else',
    message0: 'if %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    message2: 'else %1',
    args2: [{ type: 'input_statement', name: 'ELSE' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'switch_signal',
    message0: 'switch signal',
    message1: 'red %1',
    args1: [{ type: 'input_statement', name: 'RED' }],
    message2: 'blue %1',
    args2: [{ type: 'input_statement', name: 'BLUE' }],
    message3: 'green %1',
    args3: [{ type: 'input_statement', name: 'GREEN' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'path_clear',
    message0: 'clear %1 %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIRECTION',
        options: [
          ['forward', 'forward'],
          ['backward', 'backward'],
          ['right', 'right'],
          ['left', 'left']
        ]
      },
      { type: 'input_value', name: 'STEPS', check: 'Number' }
    ],
    output: 'Boolean',
    colour: 120
  },
  {
    type: 'touching_obstacle',
    message0: 'touching obstacle',
    output: 'Boolean',
    colour: 120
  },
  {
    type: 'wait_seconds',
    message0: 'wait %1 sec',
    args0: [{ type: 'input_value', name: 'SECONDS', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  }
])

const numberInput = (block, name, fallback) => {
  const target = block.getInputTargetBlock(name)
  if (!target) {
    return fallback
  }

  const value = Number(target.getFieldValue('NUM'))
  return Number.isFinite(value) ? value : fallback
}

const normalizeDirection = (direction) => (((Math.round(direction) % 4) + 4) % 4)

const getCharacterCenter = (x, y) => ({
  x: x + CHARACTER_SIZE / 2,
  y: y + CHARACTER_SIZE / 2
})

const distanceBetween = (pointA, pointB) => {
  const dx = pointA.x - pointB.x
  const dy = pointA.y - pointB.y
  return Math.sqrt(dx * dx + dy * dy)
}

const createSimulator = (caseInfo) => ({
  caseInfo,
  state: {
    x: caseInfo.stage.start.x,
    y: caseInfo.stage.start.y,
    direction: caseInfo.stage.start.direction || 0
  },
  metrics: {
    collectedStars: new Set(),
    hitObstacles: new Set(),
    totalDistance: 0,
    lastPosition: null,
    minY: caseInfo.stage.start.y,
    maxY: caseInfo.stage.start.y,
    waitedMs: 0,
    moveActionCount: 0
  }
})

const getStageObstacles = (simulator) => simulator.caseInfo.stage.obstacles || []

const resolveSignalSequence = (initialSignal, sequence, currentValue, stepField) => {
  if (!Array.isArray(sequence) || !sequence.length) {
    return initialSignal
  }

  return sequence.reduce((result, item) => {
    return currentValue >= Number(item?.[stepField] || 0) ? item.signal || result : result
  }, sequence[0].signal || initialSignal || '')
}

const getStageSignal = (simulator) => {
  const stage = simulator.caseInfo.stage
  let signal = stage.signal || ''

  signal = resolveSignalSequence(signal, stage.signalTimeline, simulator.metrics.waitedMs, 'afterWaitMs')
  signal = resolveSignalSequence(signal, stage.signalMoveSequence, simulator.metrics.moveActionCount, 'afterMoveCount')

  return String(signal).trim().toLowerCase()
}

const clampPosition = (state) => {
  state.x = Math.max(0, Math.min(WORLD_SIZE - CHARACTER_SIZE, state.x))
  state.y = Math.max(0, Math.min(WORLD_SIZE - CHARACTER_SIZE, state.y))
}

const recordMove = (simulator) => {
  const { state, metrics, caseInfo } = simulator
  clampPosition(state)

  if (metrics.lastPosition) {
    metrics.totalDistance += Math.abs(state.x - metrics.lastPosition.x) + Math.abs(state.y - metrics.lastPosition.y)
  }

  metrics.lastPosition = { x: state.x, y: state.y }
  metrics.minY = Math.min(metrics.minY, state.y)
  metrics.maxY = Math.max(metrics.maxY, state.y)

  const characterCenter = getCharacterCenter(state.x, state.y)
  const starTolerance = caseInfo.evaluation.starTolerance || 8

  for (const star of caseInfo.stage.stars || []) {
    if (metrics.collectedStars.has(star.id)) {
      continue
    }

    const starCenter = { x: star.x + MAP_ICON_SIZE / 2, y: star.y + MAP_ICON_SIZE / 2 }
    if (distanceBetween(characterCenter, starCenter) <= starTolerance) {
      metrics.collectedStars.add(star.id)
    }
  }

  for (const obstacle of caseInfo.stage.obstacles || []) {
    if (isObstacleHit(state.x, state.y, CHARACTER_SIZE, obstacle)) {
      metrics.hitObstacles.add(obstacle.id)
    }
  }
}

const animateTo = async (simulator, targetX, targetY) => {
  const dx = targetX - simulator.state.x
  const dy = targetY - simulator.state.y
  const steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy)))

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps
    simulator.state.x += (targetX - simulator.state.x) * progress / (steps - index + 1)
    simulator.state.y += (targetY - simulator.state.y) * progress / (steps - index + 1)
    recordMove(simulator)
  }

  simulator.state.x = targetX
  simulator.state.y = targetY
  recordMove(simulator)
  simulator.metrics.moveActionCount += 1
}

const getDirectionalTarget = (state, distance, directionOffset = 0) => {
  switch (normalizeDirection(state.direction + directionOffset)) {
    case 1:
      return { x: state.x, y: state.y + distance }
    case 2:
      return { x: state.x - distance, y: state.y }
    case 3:
      return { x: state.x, y: state.y - distance }
    case 0:
    default:
      return { x: state.x + distance, y: state.y }
  }
}

const getOffsetTarget = (state, dx, dy) => ({
  x: state.x + dx,
  y: state.y + dy
})

const getAbsoluteTarget = (state, direction, distance) => {
  switch (direction) {
    case 'up':
      return getOffsetTarget(state, 0, -distance)
    case 'down':
      return getOffsetTarget(state, 0, distance)
    case 'left':
      return getOffsetTarget(state, -distance, 0)
    case 'right':
    default:
      return getOffsetTarget(state, distance, 0)
  }
}

const getMovementTarget = (state, direction, distance) => {
  if (direction === 'forward') {
    return getDirectionalTarget(state, distance)
  }

  if (direction === 'backward') {
    return getDirectionalTarget(state, -distance)
  }

  if (direction === 'left') {
    return getDirectionalTarget(state, distance, -1)
  }

  if (direction === 'right') {
    return getDirectionalTarget(state, distance, 1)
  }

  return getAbsoluteTarget(state, direction, distance)
}

const isPathClear = (simulator, direction, distance = 10) => {
  const safeDistance = Math.max(0, Math.abs(Number(distance) || 10))
  const target = getMovementTarget(simulator.state, direction, safeDistance)
  const dx = target.x - simulator.state.x
  const dy = target.y - simulator.state.y
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))))

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps
    const x = simulator.state.x + dx * progress
    const y = simulator.state.y + dy * progress
    const outOfBounds =
      x < 0 ||
      y < 0 ||
      x + CHARACTER_SIZE > WORLD_SIZE ||
      y + CHARACTER_SIZE > WORLD_SIZE

    if (outOfBounds) {
      return false
    }

    const blocked = getStageObstacles(simulator).some((obstacle) => isObstacleHit(x, y, CHARACTER_SIZE, obstacle))

    if (blocked) {
      return false
    }
  }

  return true
}

const isTouchingObstacle = (simulator) => {
  return getStageObstacles(simulator).some((obstacle) => {
    return isObstacleHit(simulator.state.x, simulator.state.y, CHARACTER_SIZE, obstacle)
  })
}

const executeSequence = async (block, simulator) => {
  let current = block

  while (current) {
    switch (current.type) {
      case 'move_up': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, steps)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'move_down': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, -steps)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'move_forward': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, steps)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'move_backward': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, -steps)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'move_left': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, steps, -1)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'move_right': {
        const steps = Number(current.getFieldValue('STEPS') || 10)
        const target = getDirectionalTarget(simulator.state, steps, 1)
        await animateTo(simulator, target.x, target.y)
        break
      }
      case 'turn_left':
        simulator.state.direction = normalizeDirection(simulator.state.direction - 1)
        break
      case 'turn_right':
        simulator.state.direction = normalizeDirection(simulator.state.direction + 1)
        break
      case 'goto_xy':
        await animateTo(simulator, numberInput(current, 'X', simulator.state.x), numberInput(current, 'Y', simulator.state.y))
        break
      case 'repeat': {
        const times = Math.max(0, Math.floor(numberInput(current, 'TIMES', 1)))
        const body = current.getInputTargetBlock('DO')
        for (let index = 0; index < times; index += 1) {
          if (body) {
            await executeSequence(body, simulator)
          }
        }
        break
      }
      case 'repeat_until': {
        const conditionBlock = current.getInputTargetBlock('CONDITION')
        const body = current.getInputTargetBlock('DO')
        let iterations = 0

        while (body && iterations < 24) {
          const condition =
            conditionBlock?.type === 'path_clear'
              ? isPathClear(simulator, conditionBlock.getFieldValue('DIRECTION') || 'forward', numberInput(conditionBlock, 'STEPS', 10))
              : conditionBlock?.type === 'touching_obstacle'
                ? isTouchingObstacle(simulator)
                : false

          if (condition) {
            break
          }

          await executeSequence(body, simulator)
          iterations += 1
        }
        break
      }
      case 'if_else': {
        const conditionBlock = current.getInputTargetBlock('CONDITION')
        const condition =
          conditionBlock?.type === 'path_clear'
            ? isPathClear(simulator, conditionBlock.getFieldValue('DIRECTION') || 'forward', numberInput(conditionBlock, 'STEPS', 10))
            : conditionBlock?.type === 'touching_obstacle'
              ? isTouchingObstacle(simulator)
              : true
        const thenBlock = current.getInputTargetBlock('DO')
        const elseBlock = current.getInputTargetBlock('ELSE')
        await executeSequence(condition ? thenBlock : elseBlock, simulator)
        break
      }
      case 'switch_signal': {
        const branchMap = {
          red: 'RED',
          blue: 'BLUE',
          green: 'GREEN'
        }
        const branch = current.getInputTargetBlock(branchMap[getStageSignal(simulator)] || '')
        await executeSequence(branch, simulator)
        break
      }
      case 'wait_seconds':
        simulator.metrics.waitedMs += Math.max(0, numberInput(current, 'SECONDS', 1)) * 1000
        break
      default:
        break
    }

    current = current.getNextBlock()
  }
}

const countBlocks = (workspace) =>
  workspace.getAllBlocks(false).reduce((result, block) => {
    result[block.type] = (result[block.type] || 0) + 1
    return result
  }, {})

const getRepeatMetrics = (workspace) => {
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

const reachedTarget = (simulator, tolerance = 8) => {
  const target = simulator.caseInfo.stage.target
  if (!target) {
    return false
  }

  const targetCenter = { x: target.x + MAP_ICON_SIZE / 2, y: target.y + MAP_ICON_SIZE / 2 }
  return distanceBetween(getCharacterCenter(simulator.state.x, simulator.state.y), targetCenter) <= tolerance
}

const usedObstacleDetour = (metrics, evaluation) => {
  const detour = evaluation?.detour

  if (!detour) {
    return true
  }

  const reachedUpperLane = Number.isFinite(detour.maxY) && metrics.minY <= detour.maxY
  const reachedLowerLane = Number.isFinite(detour.minY) && metrics.maxY >= detour.minY

  return reachedUpperLane || reachedLowerLane
}

const evaluateCase = (simulator, counts, repeatMetrics) => {
  const caseInfo = simulator.caseInfo
  const evaluation = caseInfo.evaluation

  switch (evaluation.type) {
    case 'reach-target': {
      const success = reachedTarget(simulator, evaluation.tolerance)
      if (!success) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredIfElseBlocks && (counts.if_else || 0) < evaluation.requiredIfElseBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredPathCheckBlocks && (counts.path_clear || 0) < evaluation.requiredPathCheckBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredRepeatUntilBlocks && (counts.repeat_until || 0) < evaluation.requiredRepeatUntilBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredTouchingBlocks && (counts.touching_obstacle || 0) < evaluation.requiredTouchingBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredWaitBlocks && (counts.wait_seconds || 0) < evaluation.requiredWaitBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredSwitchBlocks && (counts.switch_signal || 0) < evaluation.requiredSwitchBlocks) {
        return { success: false, stars: 0 }
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
      return { success: true, stars: precise ? 3 : 2 }
    }
    case 'collect-stars': {
      const success = simulator.metrics.collectedStars.size === (caseInfo.stage.stars || []).length
      if (!success) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredRepeatBlocks && repeatMetrics.total < evaluation.requiredRepeatBlocks) {
        return { success: false, stars: 0 }
      }

      if (evaluation.requiredNestedRepeatDepth && repeatMetrics.maxDepth < evaluation.requiredNestedRepeatDepth) {
        return { success: false, stars: 0 }
      }

      const usedTurn = (counts.turn_left || 0) + (counts.turn_right || 0) >= 1
      return { success: true, stars: evaluation.requiredRepeatBlocks ? 3 : usedTurn ? 3 : 2 }
    }
    case 'avoid-obstacle': {
      const success =
        reachedTarget(simulator, evaluation.tolerance) &&
        simulator.metrics.hitObstacles.size === 0 &&
        usedObstacleDetour(simulator.metrics, evaluation)
      const enoughTurns = (counts.turn_left || 0) + (counts.turn_right || 0) >= 2
      const movementCount =
        (counts.move_up || 0) +
        (counts.move_down || 0) +
        (counts.move_forward || 0) +
        (counts.move_backward || 0) +
        (counts.move_left || 0) +
        (counts.move_right || 0) +
        (counts.move_steps || 0)
      return { success, stars: success ? (enoughTurns || movementCount <= 4 ? 3 : 2) : 0 }
    }
    case 'square-path': {
      const startCenter = getCharacterCenter(caseInfo.stage.start.x, caseInfo.stage.start.y)
      const backToStart = distanceBetween(startCenter, getCharacterCenter(simulator.state.x, simulator.state.y)) <= evaluation.maxDistanceToStart
      const success = simulator.metrics.totalDistance >= evaluation.minDistance && backToStart
      const usedRepeat = (counts.repeat || 0) >= 1
      return { success, stars: success ? (usedRepeat ? 3 : 2) : 0 }
    }
    default:
      return { success: true, stars: 2 }
  }
}

const executeXml = async (caseInfo, xmlText) => {
  const workspace = new Blockly.Workspace()
  const xml = Blockly.utils.xml.textToDom(xmlText)
  Blockly.Xml.domToWorkspace(xml, workspace)

  const simulator = createSimulator(caseInfo)
  const startBlock = workspace.getTopBlocks(true).find((block) => block.type === 'event_start')

  if (startBlock?.getNextBlock()) {
    await executeSequence(startBlock.getNextBlock(), simulator)
  }

  const counts = countBlocks(workspace)
  const repeatMetrics = getRepeatMetrics(workspace)
  const result = evaluateCase(simulator, counts, repeatMetrics)
  return {
    result,
    state: simulator.state,
    metrics: simulator.metrics
  }
}

const solutions = {
  1: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="move_right"><field name="STEPS">10</field><next><block type="move_right"><field name="STEPS">10</field><next><block type="move_right"><field name="STEPS">10</field><next><block type="move_right"><field name="STEPS">10</field><next><block type="move_right"><field name="STEPS">10</field></block></next></block></next></block></next></block></next></block></next></block></xml>',
  2: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="turn_left"><next><block type="move_up"><field name="STEPS">26</field><next><block type="turn_right"><next><block type="move_up"><field name="STEPS">20</field><next><block type="move_up"><field name="STEPS">20</field></block></next></block></next></block></next></block></next></block></next></block></xml>',
  3: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="turn_left"><next><block type="move_up"><field name="STEPS">31</field><next><block type="turn_right"><next><block type="move_up"><field name="STEPS">50</field><next><block type="turn_right"><next><block type="move_up"><field name="STEPS">26</field></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>',
  4: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="goto_xy"><value name="X"><shadow type="math_number"><field name="NUM">40</field></shadow></value><value name="Y"><shadow type="math_number"><field name="NUM">24</field></shadow></value></block></next></block></xml>',
  5: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="move_up"><field name="STEPS">10</field><next><block type="turn_right"></block></next></block></statement></block></next></block></xml>',
  6: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="move_down"><field name="STEPS">40</field><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="move_right"><field name="STEPS">15</field></block></statement></block></next></block></next></block></xml>',
  7: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="move_up"><field name="STEPS">53</field><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">2</field></shadow></value><statement name="DO"><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="move_right"><field name="STEPS">20</field></block></statement><next><block type="move_down"><field name="STEPS">15</field><next><block type="move_left"><field name="STEPS">60</field></block></next></block></next></block></statement></block></next></block></next></block></xml>',
  8: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="if_else"><value name="CONDITION"><block type="path_clear"><field name="DIRECTION">right</field><value name="STEPS"><shadow type="math_number"><field name="NUM">20</field></shadow></value></block></value><statement name="DO"><block type="move_right"><field name="STEPS">48</field></block></statement><statement name="ELSE"><block type="move_down"><field name="STEPS">24</field><next><block type="move_right"><field name="STEPS">48</field></block></next></block></statement></block></next></block></xml>',
  9: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">18</field></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">18</field><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">36</field><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">12</field></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">12</field></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">18</field></block></statement></block></next></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">12</field></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">12</field></block></statement></block></next></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">18</field></block></statement></block></next></block></xml>',
  10: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="wait_seconds"><value name="SECONDS"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">36</field></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">12</field></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">36</field><next><block type="move_right"><field name="STEPS">36</field></block></next></block></statement></block></next></block></next></block></xml>'
}

const negativeSolutions = {
  3: '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="10" y="10"><next><block type="move_right"><field name="STEPS">50</field><next><block type="move_up"><field name="STEPS">5</field></block></next></block></next></block></xml>'
}

let hasFailure = false

for (const caseInfo of teachingCases) {
  const obstacles = caseInfo.stage?.obstacles || []

  if (obstacles.some((obstacle) => !hasObstacleDefinition(obstacle))) {
    hasFailure = true
    console.error('LEVEL_SMOKE_FAIL', caseInfo.id, 'invalid-obstacle-definition')
    continue
  }

  if ([3, 8].includes(caseInfo.id) && !obstacles.some((obstacle) => isLineObstacle(obstacle))) {
    hasFailure = true
    console.error('LEVEL_SMOKE_FAIL', caseInfo.id, 'expected-line-obstacle')
    continue
  }

  const xml = solutions[caseInfo.id]

  if (!xml) {
    hasFailure = true
    console.error('LEVEL_SMOKE_FAIL', caseInfo.id, 'missing-solution')
    continue
  }

  const { result, state, metrics } = await executeXml(caseInfo, xml)
  if (!result.success || result.stars < (caseInfo.minStars || 1)) {
    hasFailure = true
    console.error(
      'LEVEL_SMOKE_FAIL',
      caseInfo.id,
      JSON.stringify({
        stars: result.stars,
        minStars: caseInfo.minStars,
        state,
        collectedStars: [...metrics.collectedStars],
        hitObstacles: [...metrics.hitObstacles],
        totalDistance: metrics.totalDistance
      })
    )
  } else {
    console.log('LEVEL_SMOKE_OK', caseInfo.id, result.stars)
  }
}

for (const caseInfo of teachingCases) {
  const xml = negativeSolutions[caseInfo.id]

  if (!xml) {
    continue
  }

  const { result } = await executeXml(caseInfo, xml)
  if (result.success) {
    hasFailure = true
    console.error('LEVEL_SMOKE_FAIL', caseInfo.id, 'negative-route-should-fail')
  } else {
    console.log('LEVEL_NEGATIVE_OK', caseInfo.id)
  }
}

if (hasFailure) {
  process.exit(1)
}
