const level06 = {
  id: 6,
  title: '关卡 6：循环收集站',
  shortTitle: '循环收集',
  description: '把重复的动作交给“重复”积木，让角色连续收集一排星星。',
  goal: '收集 4 颗排成一列的星星，并至少使用 1 个重复积木。',
  tip: '如果同样的动作要做 4 次，就不要手写 4 遍，把它放进“重复”。这一关每次要走得稍远一点。',
  helperText: '先向后移动 40 格对齐星星，再把“向右移动 15 格”放进“重复”里。',
  taskSteps: ['先向后移动 40 格，对齐第一颗星', '把“向右移动 15 格”放进“重复”里', '把次数设成 3，连续收完这一排星星'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'repeat'],
  focusBlocks: ['向右移动', '重复'],
  difficulty: 'medium',
  difficultyLabel: '算法关',
  minStars: 3,
  coverEmoji: '🔁',
  knowledgePoints: ['循环', '消除重复'],
  character: 'dog',
  backgroundId: 'school',
  stage: {
    start: { x: 20, y: 30, direction: 3 },
    target: null,
    stars: [
      { id: 'loop-star-a', x: 15, y: 73, icon: '⭐' },
      { id: 'loop-star-b', x: 31, y: 73, icon: '⭐' },
      { id: 'loop-star-c', x: 48, y: 73, icon: '⭐' },
      { id: 'loop-star-d', x: 65, y: 73, icon: '⭐' }
    ],
    obstacles: []
  },
  evaluation: {
    type: 'collect-stars',
    starTolerance: 8,
    requiredRepeatBlocks: 1,
    repeatHint: '这关要把重复动作收进“重复”积木里，别一格一格手写。'
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="move_down">
          <field name="STEPS">40</field>
          <next>
            <block type="repeat">
              <value name="TIMES">
                <shadow type="math_number">
                  <field name="NUM">3</field>
                </shadow>
              </value>
              <statement name="DO">
                <block type="move_right">
                  <field name="STEPS">15</field>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </next>
    </block>
  </xml>`
}

export default level06
