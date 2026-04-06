const Blockly = require('blockly/node')

Blockly.defineBlocksWithJsonArray([
  { type: 'event_start', message0: 'start', nextStatement: null, colour: 60 },
  {
    type: 'move_up',
    message0: 'up %1',
    args0: [{ type: 'field_number', name: 'STEPS', value: 10, min: 1, precision: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_down',
    message0: 'down %1',
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
          ['right', 'right'],
          ['down', 'down'],
          ['left', 'left'],
          ['up', 'up']
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

const intersectsObstacle = (state, x, y) =>
  (state.obstacles || []).some((obstacle) => {
    return x + 12 > obstacle.x && x < obstacle.x + obstacle.width && y + 12 > obstacle.y && y < obstacle.y + obstacle.height
  })

const isTouchingObstacle = (state) => intersectsObstacle(state, state.x, state.y)

const resolveSignal = (state) => {
  if (Array.isArray(state.signalTimeline) && state.signalTimeline.length) {
    return String(
      state.signalTimeline.reduce((result, item) => {
        return (state.waitedMs || 0) >= Number(item.afterWaitMs || 0) ? item.signal || result : result
      }, state.signalTimeline[0].signal || state.signal || '')
    )
      .trim()
      .toLowerCase()
  }

  return String(state.signal || '').trim().toLowerCase()
}

const isPathClear = (state, direction, distance = 10) => {
  const steps = Math.max(1, Math.ceil(Math.abs(distance)))
  let targetX = state.x
  let targetY = state.y

  if (direction === 'up') targetY -= distance
  if (direction === 'down') targetY += distance
  if (direction === 'left') targetX -= distance
  if (direction === 'right') targetX += distance
  if (direction === 'forward') {
    const resolveDirection = () => (((state.direction % 4) + 4) % 4)
    const facing = resolveDirection()
    if (facing === 0) targetX += distance
    if (facing === 1) targetY += distance
    if (facing === 2) targetX -= distance
    if (facing === 3) targetY -= distance
  }

  const dx = targetX - state.x
  const dy = targetY - state.y

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps
    const x = state.x + dx * progress
    const y = state.y + dy * progress
    const outOfBounds = x < 0 || y < 0 || x + 12 > 100 || y + 12 > 100

    if (outOfBounds || intersectsObstacle(state, x, y)) {
      return false
    }
  }

  return true
}

const runSequence = async (block, state) => {
  let current = block

  while (current) {
    const resolveDirection = (offset = 0) => (((state.direction + offset) % 4) + 4) % 4
    const moveByDirection = (steps, offset = 0) => {
      const direction = resolveDirection(offset)

      if (direction === 0) state.x += steps
      if (direction === 1) state.y += steps
      if (direction === 2) state.x -= steps
      if (direction === 3) state.y -= steps
    }

    switch (current.type) {
      case 'move_up':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          state.y -= steps
        }
        break
      case 'move_down':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          state.y += steps
        }
        break
      case 'move_forward':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          moveByDirection(steps)
        }
        break
      case 'move_backward':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          moveByDirection(steps, 2)
        }
        break
      case 'move_left':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          state.x -= steps
        }
        break
      case 'move_right':
        {
          const steps = Number(current.getFieldValue('STEPS') || 10)
          state.x += steps
        }
        break
      case 'turn_left':
        state.direction = (state.direction + 3) % 4
        break
      case 'turn_right':
        state.direction = (state.direction + 1) % 4
        break
      case 'goto_xy':
        state.x = numberInput(current, 'X', state.x)
        state.y = numberInput(current, 'Y', state.y)
        break
      case 'repeat': {
        const times = Math.max(0, Math.floor(numberInput(current, 'TIMES', 1)))
        const body = current.getInputTargetBlock('DO')
        for (let index = 0; index < times; index += 1) {
          if (body) {
            await runSequence(body, state)
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
              ? isPathClear(state, conditionBlock.getFieldValue('DIRECTION') || 'forward', numberInput(conditionBlock, 'STEPS', 10))
              : conditionBlock?.type === 'touching_obstacle'
                ? isTouchingObstacle(state)
                : false

          if (condition) {
            break
          }

          await runSequence(body, state)
          iterations += 1
        }
        break
      }
      case 'if_else': {
        const conditionBlock = current.getInputTargetBlock('CONDITION')
        const condition = conditionBlock?.type === 'path_clear'
          ? isPathClear(state, conditionBlock.getFieldValue('DIRECTION') || 'forward', numberInput(conditionBlock, 'STEPS', 10))
          : conditionBlock?.type === 'touching_obstacle'
            ? isTouchingObstacle(state)
            : true
        await runSequence(current.getInputTargetBlock(condition ? 'DO' : 'ELSE'), state)
        break
      }
      case 'switch_signal': {
        const branchMap = {
          red: 'RED',
          blue: 'BLUE',
          green: 'GREEN'
        }
        await runSequence(current.getInputTargetBlock(branchMap[resolveSignal(state)] || ''), state)
        break
      }
      case 'wait_seconds': {
        state.waitedMs = (state.waitedMs || 0) + Math.max(0, numberInput(current, 'SECONDS', 1)) * 1000
        break
      }
      default:
        break
    }

    current = current.getNextBlock()
  }
}

const executeXml = async (xmlText, start) => {
  const workspace = new Blockly.Workspace()
  const xml = Blockly.utils.xml.textToDom(xmlText)
  Blockly.Xml.domToWorkspace(xml, workspace)

  const state = { ...start }
  const startBlock = workspace.getTopBlocks(true).find(block => block.type === 'event_start')

  if (startBlock?.getNextBlock()) {
    await runSequence(startBlock.getNextBlock(), state)
  }

  return state
}

const checks = [
  {
    name: 'move-right',
    start: { x: 8, y: 44, direction: 0 },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"move_right\"><field name=\"STEPS\">10</field><next><block type=\"move_right\"><field name=\"STEPS\">10</field><next><block type=\"move_right\"><field name=\"STEPS\">10</field><next><block type=\"move_right\"><field name=\"STEPS\">10</field><next><block type=\"move_right\"><field name=\"STEPS\">10</field></block></next></block></next></block></next></block></next></block></next></block></xml>',
    pass: (state) => state.x === 58 && state.y === 44
  },
  {
    name: 'turn-and-move',
    start: { x: 10, y: 45, direction: 0 },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"turn_left\"><next><block type=\"move_forward\"><field name=\"STEPS\">10</field></block></next></block></next></block></xml>',
    pass: (state) => state.x === 10 && state.y === 35 && state.direction === 3
  },
  {
    name: 'move-all-directions',
    start: { x: 20, y: 40, direction: 0 },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"move_up\"><field name=\"STEPS\">10</field><next><block type=\"move_left\"><field name=\"STEPS\">10</field><next><block type=\"move_down\"><field name=\"STEPS\">10</field><next><block type=\"move_right\"><field name=\"STEPS\">10</field></block></next></block></next></block></next></block></next></block></xml>',
    pass: (state) => state.x === 20 && state.y === 40 && state.direction === 0
  },
  {
    name: 'goto-xy',
    start: { x: 8, y: 45, direction: 0 },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"goto_xy\"><value name=\"X\"><shadow type=\"math_number\"><field name=\"NUM\">40</field></shadow></value><value name=\"Y\"><shadow type=\"math_number\"><field name=\"NUM\">24</field></shadow></value></block></next></block></xml>',
    pass: (state) => state.x === 40 && state.y === 24
  },
  {
    name: 'repeat-square',
    start: { x: 24, y: 38, direction: 0 },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"repeat\"><value name=\"TIMES\"><shadow type=\"math_number\"><field name=\"NUM\">4</field></shadow></value><statement name=\"DO\"><block type=\"move_forward\"><field name=\"STEPS\">10</field><next><block type=\"turn_right\"></block></next></block></statement></block></next></block></xml>',
    pass: (state) => state.x === 24 && state.y === 38 && state.direction === 0
  },
  {
    name: 'if-else-branch',
    start: {
      x: 10,
      y: 26,
      direction: 0,
      obstacles: [{ x: 28, y: 18, width: 18, height: 24 }]
    },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"if_else\"><value name=\"CONDITION\"><block type=\"path_clear\"><field name=\"DIRECTION\">right</field><value name=\"STEPS\"><shadow type=\"math_number\"><field name=\"NUM\">20</field></shadow></value></block></value><statement name=\"DO\"><block type=\"move_right\"><field name=\"STEPS\">48</field></block></statement><statement name=\"ELSE\"><block type=\"move_down\"><field name=\"STEPS\">24</field><next><block type=\"move_right\"><field name=\"STEPS\">48</field></block></next></block></statement></block></next></block></xml>',
    pass: (state) => state.x === 58 && state.y === 50
  },
  {
    name: 'switch-signal',
    start: { x: 12, y: 12, direction: 0, signal: 'blue' },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"switch_signal\"><statement name=\"RED\"><block type=\"move_right\"><field name=\"STEPS\">36</field></block></statement><statement name=\"BLUE\"><block type=\"move_down\"><field name=\"STEPS\">36</field><next><block type=\"move_right\"><field name=\"STEPS\">36</field></block></next></block></statement><statement name=\"GREEN\"><block type=\"move_down\"><field name=\"STEPS\">12</field></block></statement></block></next></block></xml>',
    pass: (state) => state.x === 48 && state.y === 48
  },
  {
    name: 'repeat-until-touching',
    start: {
      x: 12,
      y: 22,
      direction: 0,
      obstacles: [{ x: 40, y: 18, width: 10, height: 24 }]
    },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"repeat_until\"><value name=\"CONDITION\"><block type=\"touching_obstacle\"></block></value><statement name=\"DO\"><block type=\"move_right\"><field name=\"STEPS\">6</field></block></statement><next><block type=\"move_down\"><field name=\"STEPS\">28</field><next><block type=\"move_right\"><field name=\"STEPS\">20</field></block></next></block></next></block></next></block></xml>',
    pass: (state) => state.x === 50 && state.y === 50
  },
  {
    name: 'wait-and-switch',
    start: {
      x: 12,
      y: 12,
      direction: 0,
      signal: 'red',
      waitedMs: 0,
      signalTimeline: [
        { afterWaitMs: 0, signal: 'red' },
        { afterWaitMs: 1000, signal: 'green' }
      ]
    },
    xml: '<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"event_start\" x=\"10\" y=\"10\"><next><block type=\"wait_seconds\"><value name=\"SECONDS\"><shadow type=\"math_number\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"switch_signal\"><statement name=\"RED\"><block type=\"move_right\"><field name=\"STEPS\">36</field></block></statement><statement name=\"BLUE\"><block type=\"move_down\"><field name=\"STEPS\">12</field></block></statement><statement name=\"GREEN\"><block type=\"move_down\"><field name=\"STEPS\">36</field><next><block type=\"move_right\"><field name=\"STEPS\">36</field></block></next></block></statement></block></next></block></next></block></xml>',
    pass: (state) => state.x === 48 && state.y === 48 && state.waitedMs === 1000
  }
]

;(async () => {
  for (const item of checks) {
    const result = await executeXml(item.xml, item.start)

    if (!item.pass(result)) {
      console.error('SMOKE_FAIL', item.name, result)
      process.exit(1)
    }
  }

  console.log('SMOKE_OK')
})()
