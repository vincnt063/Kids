const level07 = {
  id: 7,
  title: '关卡 7：嵌套循环星阵',
  shortTitle: '嵌套循环',
  description: '把“重复”积木放进另一个“重复”里，用更像 Scratch 的方法收集两排星星。',
  goal: '收集 6 颗星星，并至少用出 1 层嵌套循环。',
  tip: '先在里面的“重复”里写一排动作，再用外面的“重复”控制做两排。这关要把移动距离调大一点。',
  helperText: '先向前移动 53 格对齐第一排星星，再用“重复里面再放重复”完成两排路线。',
  taskSteps: ['先向前移动 53 格，到第一排星星旁边', '内层“重复”设成 3 次，每次向右移动 20 格', '外层“重复”设成 2 次，每排结束后向后 15 格，再向左 60 格回到起点'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'repeat'],
  focusBlocks: ['向右移动', '向左移动', '向后移动', '重复'],
  difficulty: 'hard',
  difficultyLabel: '进阶编程关',
  minStars: 3,
  coverEmoji: '🧠',
  knowledgePoints: ['嵌套循环', '模式抽象'],
  character: 'robot',
  backgroundId: 'space',
  stage: {
    start: { x: 20, y: 70, direction: 3 },
    target: null,
    stars: [
      { id: 'grid-a', x: 20, y: 20, icon: '⭐' },
      { id: 'grid-b', x: 40, y: 20, icon: '⭐' },
      { id: 'grid-c', x: 60, y: 20, icon: '⭐' },
      { id: 'grid-d', x: 20, y: 35, icon: '⭐' },
      { id: 'grid-e', x: 40, y: 35, icon: '⭐' },
      { id: 'grid-f', x: 60, y: 35, icon: '⭐' }
    ],
    obstacles: []
  },
  evaluation: {
    type: 'collect-stars',
    starTolerance: 8,
    requiredRepeatBlocks: 2,
    requiredNestedRepeatDepth: 2,
    repeatHint: '这关至少要用 2 个“重复”积木。',
    nestedRepeatHint: '把一个“重复”放进另一个“重复”里，这样才算真正的嵌套循环。'
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="move_up">
          <field name="STEPS">53</field>
          <next>
            <block type="repeat">
              <value name="TIMES">
                <shadow type="math_number">
                  <field name="NUM">2</field>
                </shadow>
              </value>
              <statement name="DO">
                <block type="repeat">
                  <value name="TIMES">
                    <shadow type="math_number">
                      <field name="NUM">3</field>
                    </shadow>
                  </value>
                  <statement name="DO">
                    <block type="move_right">
                      <field name="STEPS">20</field>
                    </block>
                  </statement>
                  <next>
                    <block type="move_down">
                      <field name="STEPS">15</field>
                      <next>
                        <block type="move_left">
                          <field name="STEPS">60</field>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </next>
    </block>
  </xml>`
}

export default level07
