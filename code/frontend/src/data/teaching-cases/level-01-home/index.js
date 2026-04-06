const level01 = {
  id: 1,
  title: '关卡 1：小猫回家',
  shortTitle: '小猫回家',
  description: '拖拽“向前、向后、向左、向右移动”积木，帮助小猫走到右侧的小房子。',
  goal: '让小猫到达舞台右下方的房子。',
  tip: '先试试前后左右四个方向怎么走，再拼出一条能回家的路线。',
  helperText: '把移动积木接到“点击开始”下方，前后左右都可以试一试。',
  taskSteps: ['把“向右移动”接到“点击开始”下方', '把距离调到 50 格左右', '点击开始，让小猫走到房子旁边'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right'],
  focusBlocks: ['向前移动', '向后移动', '向左移动', '向右移动'],
  difficulty: 'easy',
  difficultyLabel: '热身关',
  minStars: 1,
  coverEmoji: '🏠',
  knowledgePoints: ['顺序执行', '基础移动'],
  character: 'cat',
  backgroundId: 'school',
  stage: {
    start: { x: 8, y: 44, direction: 3 },
    target: { x: 57, y: 42, icon: '🏠', label: '家' },
    stars: [],
    obstacles: []
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 9
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="move_right"></block>
      </next>
    </block>
  </xml>`
}

export default level01
