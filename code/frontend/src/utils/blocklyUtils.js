import * as Blockly from 'blockly/core'
import 'blockly/blocks'

let customBlocksDefined = false

const minimalBlocks = [
  {
    type: 'event_start',
    message0: '点击开始',
    nextStatement: null,
    colour: 60
  },
  {
    type: 'move_up',
    message0: '向前移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_down',
    message0: '向后移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_forward',
    message0: '向前移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_backward',
    message0: '向后移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_left',
    message0: '向左移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_right',
    message0: '向右移动 %1 格',
    args0: [
      {
        type: 'field_number',
        name: 'STEPS',
        value: 10,
        min: 1,
        precision: 1
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'turn_left',
    message0: '向左转 ◂',
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'turn_right',
    message0: '向右转 ▸',
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'goto_xy',
    message0: '移到 x: %1 y: %2',
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
    message0: '重复 %1 次 🔁',
    args0: [{ type: 'input_value', name: 'TIMES', check: 'Number' }],
    message1: '执行 %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'repeat_until',
    message0: '重复执行直到 %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: '执行 %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'if_else',
    message0: '如果 %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: '那么 %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    message2: '否则 %1',
    args2: [{ type: 'input_statement', name: 'ELSE' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'switch_signal',
    message0: '根据当前信号选择',
    message1: '红色 %1',
    args1: [{ type: 'input_statement', name: 'RED' }],
    message2: '蓝色 %1',
    args2: [{ type: 'input_statement', name: 'BLUE' }],
    message3: '绿色 %1',
    args3: [{ type: 'input_statement', name: 'GREEN' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'path_clear',
    message0: '%1 能走 %2 格',
    args0: [
      {
        type: 'field_dropdown',
        name: 'DIRECTION',
        options: [
          ['前方', 'forward'],
          ['后方', 'backward'],
          ['右方', 'right'],
          ['左方', 'left']
        ]
      },
      { type: 'input_value', name: 'STEPS', check: 'Number' }
    ],
    output: 'Boolean',
    colour: 120
  },
  {
    type: 'touching_obstacle',
    message0: '碰到障碍物',
    output: 'Boolean',
    colour: 120
  },
  {
    type: 'wait_seconds',
    message0: '等待 %1 秒',
    args0: [{ type: 'input_value', name: 'SECONDS', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  },
  {
    type: 'say',
    message0: '说 %1',
    args0: [{ type: 'input_value', name: 'MESSAGE' }],
    previousStatement: null,
    nextStatement: null,
    colour: 280
  }
]

// 保留旧积木定义用于兼容历史本地草稿，但不再主动推荐给新手关卡。
const legacyBlocks = [
  {
    type: 'move_steps',
    message0: '移动 %1 步',
    args0: [{ type: 'input_value', name: 'STEPS', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'move_to',
    message0: '移到 x: %1 y: %2',
    args0: [
      { type: 'input_value', name: 'X', check: 'Number' },
      { type: 'input_value', name: 'Y', check: 'Number' }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'set_direction',
    message0: '面向 %1 方向',
    args0: [{ type: 'input_value', name: 'DIRECTION', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'bounce_edge',
    message0: '碰到边缘就反弹',
    previousStatement: null,
    nextStatement: null,
    colour: 210
  },
  {
    type: 'change_x',
    message0: 'x 坐标增加 %1',
    args0: [{ type: 'input_value', name: 'DX', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 90
  },
  {
    type: 'change_y',
    message0: 'y 坐标增加 %1',
    args0: [{ type: 'input_value', name: 'DY', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 90
  },
  {
    type: 'set_x',
    message0: '将 x 坐标设为 %1',
    args0: [{ type: 'input_value', name: 'X', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 90
  },
  {
    type: 'set_y',
    message0: '将 y 坐标设为 %1',
    args0: [{ type: 'input_value', name: 'Y', check: 'Number' }],
    previousStatement: null,
    nextStatement: null,
    colour: 90
  },
  {
    type: 'show',
    message0: '显示 👀',
    previousStatement: null,
    nextStatement: null,
    colour: 280
  },
  {
    type: 'hide',
    message0: '隐藏 🙈',
    previousStatement: null,
    nextStatement: null,
    colour: 280
  },
  {
    type: 'if_then',
    message0: '如果 %1 那么 ❓',
    args0: [{ type: 'input_value', name: 'CONDITION' }],
    message1: '执行 %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: 30
  }
]

const defaultPlayableBlocks = [
  'move_up',
  'move_down',
  'move_left',
  'move_right',
  'turn_left',
  'turn_right',
  'goto_xy',
  'repeat',
  'repeat_until',
  'if_else',
  'switch_signal',
  'path_clear',
  'touching_obstacle',
  'wait_seconds',
  'say'
]

const categoryOrder = [
  {
    id: 'events',
    name: '开始',
    colour: '#FFC63A',
    blocks: ['event_start']
  },
  {
    id: 'movement',
    name: '移动',
    colour: '#42A5F5',
    blocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right']
  },
  {
    id: 'coordinates',
    name: '坐标',
    colour: '#63C46B',
    blocks: ['goto_xy']
  },
  {
    id: 'control',
    name: '控制',
    colour: '#FF9F43',
    blocks: ['repeat', 'repeat_until', 'if_else', 'switch_signal', 'wait_seconds']
  },
  {
    id: 'conditions',
    name: '判断',
    colour: '#7BC043',
    blocks: ['path_clear', 'touching_obstacle']
  },
  {
    id: 'looks',
    name: '说话',
    colour: '#B57BFF',
    blocks: ['say']
  },
  {
    id: 'data',
    name: '数字和文字',
    colour: '#4C97FF',
    blocks: ['math_number', 'text']
  }
]

const blockDependencies = {
  goto_xy: ['math_number'],
  repeat: ['math_number'],
  wait_seconds: ['math_number'],
  path_clear: ['math_number'],
  say: ['text']
}

const blockToolboxFactory = {
  event_start: () => ({ kind: 'block', type: 'event_start' }),
  move_up: () => ({
    kind: 'block',
    type: 'move_up',
    fields: {
      STEPS: 10
    }
  }),
  move_down: () => ({
    kind: 'block',
    type: 'move_down',
    fields: {
      STEPS: 10
    }
  }),
  move_forward: () => ({
    kind: 'block',
    type: 'move_forward',
    fields: {
      STEPS: 10
    }
  }),
  move_backward: () => ({
    kind: 'block',
    type: 'move_backward',
    fields: {
      STEPS: 10
    }
  }),
  move_left: () => ({
    kind: 'block',
    type: 'move_left',
    fields: {
      STEPS: 10
    }
  }),
  move_right: () => ({
    kind: 'block',
    type: 'move_right',
    fields: {
      STEPS: 10
    }
  }),
  turn_left: () => ({ kind: 'block', type: 'turn_left' }),
  turn_right: () => ({ kind: 'block', type: 'turn_right' }),
  goto_xy: () => ({
    kind: 'block',
    type: 'goto_xy',
    inputs: {
      X: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 200
          }
        }
      },
      Y: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 120
          }
        }
      }
    }
  }),
  repeat: () => ({
    kind: 'block',
    type: 'repeat',
    inputs: {
      TIMES: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 4
          }
        }
      }
    }
  }),
  repeat_until: () => ({
    kind: 'block',
    type: 'repeat_until'
  }),
  if_else: () => ({
    kind: 'block',
    type: 'if_else'
  }),
  switch_signal: () => ({
    kind: 'block',
    type: 'switch_signal'
  }),
  path_clear: () => ({
    kind: 'block',
    type: 'path_clear',
    fields: {
      DIRECTION: 'forward'
    },
    inputs: {
      STEPS: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 10
          }
        }
      }
    }
  }),
  touching_obstacle: () => ({
    kind: 'block',
    type: 'touching_obstacle'
  }),
  wait_seconds: () => ({
    kind: 'block',
    type: 'wait_seconds',
    inputs: {
      SECONDS: {
        shadow: {
          type: 'math_number',
          fields: {
            NUM: 1
          }
        }
      }
    }
  }),
  say: () => ({
    kind: 'block',
    type: 'say',
    inputs: {
      MESSAGE: {
        shadow: {
          type: 'text',
          fields: {
            TEXT: '你好，我会编程'
          }
        }
      }
    }
  }),
  math_number: () => ({ kind: 'block', type: 'math_number' }),
  text: () => ({ kind: 'block', type: 'text' })
}

const resolveAvailableBlocks = (caseInfoOrBlockTypes) => {
  if (Array.isArray(caseInfoOrBlockTypes)) {
    return caseInfoOrBlockTypes
  }

  if (caseInfoOrBlockTypes?.availableBlocks?.length) {
    return caseInfoOrBlockTypes.availableBlocks
  }

  return defaultPlayableBlocks
}

const buildToolboxContents = (caseInfoOrBlockTypes) => {
  const allowedBlocks = new Set(['event_start', ...resolveAvailableBlocks(caseInfoOrBlockTypes)])

  Array.from(allowedBlocks).forEach((blockType) => {
    ;(blockDependencies[blockType] || []).forEach((dependency) => {
      allowedBlocks.add(dependency)
    })
  })

  return categoryOrder
    .map((category) => {
      const contents = category.blocks
        .filter((blockType) => allowedBlocks.has(blockType))
        .map((blockType) => blockToolboxFactory[blockType]?.())
        .filter(Boolean)

      if (!contents.length) {
        return null
      }

      return {
        kind: 'category',
        name: category.name,
        colour: category.colour,
        contents
      }
    })
    .filter(Boolean)
}

const getTextFromInputBlock = (block, fallback = '') => {
  if (!block) {
    return fallback
  }

  if (block.type === 'math_number') {
    return String(block.getFieldValue('NUM') ?? fallback)
  }

  if (block.type === 'text' || block.type === 'text_multiline') {
    return `"${block.getFieldValue('TEXT') || fallback}"`
  }

  if (block.type === 'logic_boolean') {
    return block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false'
  }

  if (block.type === 'path_clear') {
    const direction = block.getFieldValue('DIRECTION') || 'forward'
    const distance = getTextFromInputBlock(block.getInputTargetBlock('STEPS'), '10')
    return `canMove("${direction}", ${distance})`
  }

  if (block.type === 'touching_obstacle') {
    return 'isTouchingObstacle()'
  }

  if (block.type === 'move_forward') {
    return `moveForward(${block.getFieldValue('STEPS') || 10})`
  }

  if (block.type === 'move_up') {
    return `moveForward(${block.getFieldValue('STEPS') || 10})`
  }

  if (block.type === 'move_down') {
    return `moveBackward(${block.getFieldValue('STEPS') || 10})`
  }

  return fallback
}

const appendIndentedLine = (lines, depth, text) => {
  lines.push(`${'  '.repeat(depth)}${text}`)
}

const buildPseudoCodeLines = (block, lines = [], depth = 0) => {
  let current = block

  while (current) {
    switch (current.type) {
      case 'event_start':
        appendIndentedLine(lines, depth, 'whenStartClicked()')
        if (current.getNextBlock()) {
          buildPseudoCodeLines(current.getNextBlock(), lines, depth + 1)
        }
        return lines
      case 'move_forward':
        appendIndentedLine(lines, depth, `moveForward(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_up':
        appendIndentedLine(lines, depth, `moveForward(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_down':
        appendIndentedLine(lines, depth, `moveBackward(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_backward':
        appendIndentedLine(lines, depth, `moveBackward(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_left':
        appendIndentedLine(lines, depth, `moveLeft(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_right':
        appendIndentedLine(lines, depth, `moveRight(${current.getFieldValue('STEPS') || 10})`)
        break
      case 'move_steps':
        appendIndentedLine(lines, depth, `moveSteps(${getTextFromInputBlock(current.getInputTargetBlock('STEPS'), '10')})`)
        break
      case 'turn_left':
        appendIndentedLine(lines, depth, 'turnLeft()')
        break
      case 'turn_right':
        appendIndentedLine(lines, depth, 'turnRight()')
        break
      case 'goto_xy':
      case 'move_to':
        appendIndentedLine(
          lines,
          depth,
          `goTo(${getTextFromInputBlock(current.getInputTargetBlock('X'), '0')}, ${getTextFromInputBlock(current.getInputTargetBlock('Y'), '0')})`
        )
        break
      case 'repeat': {
        const times = getTextFromInputBlock(current.getInputTargetBlock('TIMES'), '1')
        appendIndentedLine(lines, depth, `repeat(${times}) {`)
        const bodyBlock = current.getInputTargetBlock('DO')
        if (bodyBlock) {
          buildPseudoCodeLines(bodyBlock, lines, depth + 1)
        } else {
          appendIndentedLine(lines, depth + 1, '// 在这里放要重复的动作')
        }
        appendIndentedLine(lines, depth, '}')
        break
      }
      case 'repeat_until': {
        const condition = getTextFromInputBlock(current.getInputTargetBlock('CONDITION'), 'false')
        appendIndentedLine(lines, depth, `repeatUntil(${condition}) {`)
        const bodyBlock = current.getInputTargetBlock('DO')
        if (bodyBlock) {
          buildPseudoCodeLines(bodyBlock, lines, depth + 1)
        } else {
          appendIndentedLine(lines, depth + 1, '// 在这里放会重复执行的动作')
        }
        appendIndentedLine(lines, depth, '}')
        break
      }
      case 'if_else': {
        const condition = getTextFromInputBlock(current.getInputTargetBlock('CONDITION'), 'true')
        appendIndentedLine(lines, depth, `if (${condition}) {`)
        const thenBlock = current.getInputTargetBlock('DO')
        if (thenBlock) {
          buildPseudoCodeLines(thenBlock, lines, depth + 1)
        } else {
          appendIndentedLine(lines, depth + 1, '// 条件成立时执行这里')
        }
        appendIndentedLine(lines, depth, '} else {')
        const elseBlock = current.getInputTargetBlock('ELSE')
        if (elseBlock) {
          buildPseudoCodeLines(elseBlock, lines, depth + 1)
        } else {
          appendIndentedLine(lines, depth + 1, '// 条件不成立时执行这里')
        }
        appendIndentedLine(lines, depth, '}')
        break
      }
      case 'switch_signal': {
        appendIndentedLine(lines, depth, 'switch(stageSignal()) {')
        ;[
          ['RED', 'red'],
          ['BLUE', 'blue'],
          ['GREEN', 'green']
        ].forEach(([inputName, signal]) => {
          appendIndentedLine(lines, depth + 1, `case "${signal}":`)
          const branchBlock = current.getInputTargetBlock(inputName)
          if (branchBlock) {
            buildPseudoCodeLines(branchBlock, lines, depth + 2)
          } else {
            appendIndentedLine(lines, depth + 2, '// 这个分支暂时还没有动作')
          }
          appendIndentedLine(lines, depth + 2, 'break')
        })
        appendIndentedLine(lines, depth, '}')
        break
      }
      case 'wait_seconds':
        appendIndentedLine(
          lines,
          depth,
          `wait(${getTextFromInputBlock(current.getInputTargetBlock('SECONDS'), '1')})`
        )
        break
      case 'say':
        appendIndentedLine(
          lines,
          depth,
          `say(${getTextFromInputBlock(current.getInputTargetBlock('MESSAGE'), '"你好，我会编程"')})`
        )
        break
      default:
        appendIndentedLine(lines, depth, `// ${current.type}`)
        break
    }

    current = current.getNextBlock()
  }

  return lines
}

export class BlockUtils {
  static defineCustomBlocks() {
    if (customBlocksDefined) {
      return
    }

    Blockly.defineBlocksWithJsonArray([...minimalBlocks, ...legacyBlocks])
    customBlocksDefined = true
  }

  static getToolboxConfig(caseInfoOrBlockTypes = null) {
    return {
      kind: 'categoryToolbox',
      contents: buildToolboxContents(caseInfoOrBlockTypes)
    }
  }

  static initWorkspace(container, toolbox, options = {}) {
    return Blockly.inject(container, {
      toolbox,
      grid: {
        spacing: 24,
        length: 4,
        colour: '#d5deea',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.08,
        maxScale: 2.2,
        minScale: 0.6,
        scaleSpeed: 1.12
      },
      renderer: 'zelos',
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      },
      sounds: false,
      comments: false,
      collapse: false,
      ...options
    })
  }

  static createWorkspace(container, caseInfoOrOnBlockChange, maybeOnBlockChange) {
    this.defineCustomBlocks()

    const caseInfo = typeof caseInfoOrOnBlockChange === 'function' ? null : caseInfoOrOnBlockChange
    const onBlockChange = typeof caseInfoOrOnBlockChange === 'function' ? caseInfoOrOnBlockChange : maybeOnBlockChange
    const workspace = this.initWorkspace(container, this.getToolboxConfig(caseInfo))

    if (onBlockChange) {
      workspace.addChangeListener((event) => {
        if (event?.isUiEvent) {
          return
        }

        onBlockChange(event)
      })
    }

    return workspace
  }

  static updateWorkspaceToolbox(workspace, caseInfoOrBlockTypes = null) {
    if (!workspace) {
      return
    }

    workspace.updateToolbox(this.getToolboxConfig(caseInfoOrBlockTypes))
  }

  static workspaceToXml(workspace) {
    const xml = Blockly.Xml.workspaceToDom(workspace)
    return Blockly.Xml.domToText(xml)
  }

  static generatePseudoCode(workspace) {
    if (!workspace) {
      return 'whenStartClicked()\n  // 先把积木拖进来'
    }

    const topBlocks = workspace.getTopBlocks(true)
    if (!topBlocks.length) {
      return 'whenStartClicked()\n  // 先把积木拖进来'
    }

    const startBlock = topBlocks.find((block) => block.type === 'event_start') || topBlocks[0]
    const lines = buildPseudoCodeLines(startBlock)
    return lines.length ? lines.join('\n') : 'whenStartClicked()\n  // 先把积木拖进来'
  }

  static loadWorkspaceFromXml(workspace, xmlText) {
    if (!xmlText) {
      return
    }

    Blockly.Events.disable()

    try {
      const xml = Blockly.Xml.textToDom(xmlText)
      Blockly.Xml.domToWorkspace(xml, workspace)
    } finally {
      Blockly.Events.enable()
    }

    workspace.render()
  }

  static clearWorkspace(workspace) {
    Blockly.Events.disable()

    try {
      workspace.clear()
    } finally {
      Blockly.Events.enable()
    }
  }

  static zoomWorkspace(workspace, delta) {
    workspace.zoomCenter(delta)
  }

  static resizeWorkspace(workspace) {
    if (!workspace) {
      return
    }

    Blockly.svgResize(workspace)
    workspace.resizeContents?.()
    workspace.resize?.()
  }

  static setWorkspaceScale(workspace, scale) {
    if (!workspace || typeof workspace.setScale !== 'function') {
      return
    }

    const zoomOptions = workspace.options?.zoomOptions || {}
    const minScale = zoomOptions.minScale || 0.6
    const maxScale = zoomOptions.maxScale || 2.2
    const nextScale = Math.max(minScale, Math.min(maxScale, scale))

    workspace.setScale(nextScale)
    this.resizeWorkspace(workspace)
  }
}

export class BlockExecutor {
  static async executeWorkspace(workspace, engine) {
    try {
      return await engine.executeWorkspace(workspace)
    } catch (error) {
      console.error('执行积木块失败:', error)
      throw error
    }
  }

  static validateBlocks(workspace) {
    const blocks = workspace.getAllBlocks(false)
    const errors = []
    const startBlock = blocks.find((block) => block.type === 'event_start')

    if (blocks.length === 0) {
      errors.push('先把积木拖到中间的大白板里。')
    }

    if (!startBlock) {
      errors.push('先找到“点击开始”积木，再开始。')
    } else if (!startBlock.getNextBlock()) {
      errors.push('把一个动作积木接到“点击开始”下方，再点开始运行。')
    }

    return errors
  }

  static countBlocks(workspace) {
    return workspace.getAllBlocks(false).reduce((result, block) => {
      result[block.type] = (result[block.type] || 0) + 1
      return result
    }, {})
  }
}
