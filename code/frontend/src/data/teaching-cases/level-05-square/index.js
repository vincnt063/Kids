const level05 = {
  id: 5,
  title: '关卡 5：画一个正方形',
  shortTitle: '画正方形',
  description: '把“移动”和“右转”组合起来，尽量用重复积木让角色绕一圈。',
  goal: '围着方形路线走一圈，尽量回到起点附近。',
  tip: '如果你能让角色回到出发点，而且用到了“重复”，说明你已经很会整理步骤了。',
  helperText: '先写一段“向前移动 + 转弯”，再把它放进“重复”里。',
  taskSteps: ['先写一组“向前移动 10 格 + 向右转”', '把这组动作放进“重复”里', '把次数设成 4，让角色绕一圈回到起点附近'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'repeat'],
  focusBlocks: ['向前移动', '向右转', '重复'],
  difficulty: 'medium',
  difficultyLabel: '创作关',
  minStars: 3,
  coverEmoji: '⬜',
  knowledgePoints: ['重复', '模式识别'],
  character: 'cat',
  backgroundId: 'rainbow',
  stage: {
    start: { x: 24, y: 38, direction: 0 },
    target: null,
    stars: [],
    obstacles: [],
    guidePoints: [
      { id: 'p1', x: 24, y: 38 },
      { id: 'p2', x: 46, y: 38 },
      { id: 'p3', x: 46, y: 20 },
      { id: 'p4', x: 24, y: 20 }
    ]
  },
  evaluation: {
    type: 'square-path',
    minDistance: 36,
    maxDistanceToStart: 9
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="repeat">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">4</field>
            </shadow>
          </value>
          <statement name="DO">
            <block type="move_up">
              <next>
                <block type="turn_right"></block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>`
}

export default level05
