const level02 = {
  id: 2,
  title: '关卡 2：收集星星',
  shortTitle: '收集星星',
  description: '用转向和移动积木控制小猫，把 3 颗星星都碰到。',
  goal: '收集舞台上的 3 颗星星。',
  tip: '先往前走，再拐弯，会更容易碰到上方的星星。',
  helperText: '这关主要用“向前移动”“向左转”“向右转”。',
  taskSteps: ['先向左转，让角色朝向第一颗星', '向前移动 26 格，再向右转', '再向前移动两次，把后面两颗星也碰到'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right'],
  focusBlocks: ['向前移动', '向左转', '向右转'],
  difficulty: 'easy',
  difficultyLabel: '观察关',
  minStars: 2,
  coverEmoji: '⭐',
  knowledgePoints: ['转向', '路线规划'],
  character: 'cat',
  backgroundId: 'forest',
  stage: {
    start: { x: 10, y: 45, direction: 0 },
    target: null,
    stars: [
      { id: 'star-a', x: 16, y: 22, icon: '⭐' },
      { id: 'star-b', x: 36, y: 15, icon: '⭐' },
      { id: 'star-c', x: 56, y: 28, icon: '⭐' }
    ],
    obstacles: []
  },
  evaluation: {
    type: 'collect-stars',
    starTolerance: 8
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="move_up">
          <next>
            <block type="turn_left"></block>
          </next>
        </block>
      </next>
    </block>
  </xml>`
}

export default level02
