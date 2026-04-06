const level08 = {
  id: 8,
  title: '关卡 8：先判断再行动',
  shortTitle: 'if 判断',
  description: '前面有路就直走，没路就换一条路线。这关重点是“先判断，再行动”。',
  goal: '到达终点，并至少用 1 个“如果否则”和 1 个“方向能走”积木。',
  helperText: '把“右方能走 20 格”塞进 if 条件里。能走就直走，不能走就先向后移动再向右。',
  taskSteps: ['先把“右方能走 20 格”接进 if 条件', '那么里放“向右移动 48 格”', '否则里放“向后移动 24 格，再向右移动 48 格”'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'if_else', 'path_clear'],
  focusBlocks: ['如果否则', '方向能走', '向右移动', '向后移动'],
  difficulty: 'hard',
  difficultyLabel: '判断关',
  minStars: 3,
  coverEmoji: '🚦',
  knowledgePoints: ['条件判断', 'if / else'],
  character: 'penguin',
  backgroundId: 'forest',
  stage: {
    start: { x: 10, y: 26, direction: 3 },
    target: { x: 58, y: 50, icon: '🏁', label: '终点' },
    stars: [],
    obstacles: [
      { id: 'if-wall', type: 'line', x1: 28, y1: 18, x2: 28, y2: 42, thickness: 2, icon: '🧱' }
    ]
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 9,
    requiredIfElseBlocks: 1,
    requiredPathCheckBlocks: 1,
    ifElseHint: '这关要先判断再行动，至少放 1 个“如果否则”积木。',
    pathCheckHint: '把“方向能走”接进 if 条件里，程序才是在真的做判断。',
    successMessage: '你已经让程序先判断右方能不能走，再决定怎么走了。'
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="if_else">
          <value name="CONDITION">
            <block type="path_clear">
              <field name="DIRECTION">right</field>
              <value name="STEPS">
                <shadow type="math_number">
                  <field name="NUM">20</field>
                </shadow>
              </value>
            </block>
          </value>
          <statement name="DO">
            <block type="move_right">
              <field name="STEPS">48</field>
            </block>
          </statement>
          <statement name="ELSE">
            <block type="move_down">
              <field name="STEPS">24</field>
              <next>
                <block type="move_right">
                  <field name="STEPS">48</field>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>`
}

export default level08
