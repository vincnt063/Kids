const level09 = {
  id: 9,
  title: '关卡 9：信号分流站',
  shortTitle: 'switch 选择',
  description: '舞台会根据移动次数切换信号：开始是蓝色，移动一次变红色，再移动一次变绿色。',
  goal: '到达终点，并至少用 3 个“根据当前信号选择”积木。',
  helperText: '先看当前信号，再每移动一次就重新判断一次。第一个信号是蓝色，移动一次会变红色，再移动一次会变绿色。',
  taskSteps: ['先放第一个“根据当前信号选择”，在蓝色分支里向后移动 18 格', '再接第二个“根据当前信号选择”，等信号变成红色后向右移动 36 格', '最后接第三个“根据当前信号选择”，等信号变成绿色后再向后移动 18 格到终点'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'switch_signal'],
  focusBlocks: ['switch 选择', '向右移动', '向后移动'],
  difficulty: 'hard',
  difficultyLabel: '分支关',
  minStars: 3,
  coverEmoji: '🎛️',
  knowledgePoints: ['switch 选择', '多分支程序'],
  character: 'robot',
  backgroundId: 'space',
  stage: {
    signal: 'blue',
    signalMoveSequence: [
      { afterMoveCount: 0, signal: 'blue' },
      { afterMoveCount: 1, signal: 'red' },
      { afterMoveCount: 2, signal: 'green' }
    ],
    start: { x: 12, y: 12, direction: 3 },
    target: { x: 48, y: 48, icon: '🏁', label: '终点' },
    stars: [],
    obstacles: []
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 9,
    requiredSwitchBlocks: 3,
    switchHint: '这关要连续用 3 次“根据当前信号选择”，跟着蓝色、红色、绿色依次换分支。',
    successMessage: '你已经跟着蓝色、红色、绿色三个信号依次选对分支，顺利到达目标。'
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="switch_signal">
          <statement name="RED">
            <block type="move_right">
              <field name="STEPS">18</field>
            </block>
          </statement>
          <statement name="BLUE">
            <block type="move_down">
              <field name="STEPS">18</field>
              <next>
                <block type="switch_signal">
                  <statement name="RED">
                    <block type="move_right">
                      <field name="STEPS">36</field>
                      <next>
                        <block type="switch_signal">
                          <statement name="RED">
                            <block type="move_right">
                              <field name="STEPS">12</field>
                            </block>
                          </statement>
                          <statement name="BLUE">
                            <block type="move_down">
                              <field name="STEPS">12</field>
                            </block>
                          </statement>
                          <statement name="GREEN">
                            <block type="move_down">
                              <field name="STEPS">18</field>
                            </block>
                          </statement>
                        </block>
                      </next>
                    </block>
                  </statement>
                  <statement name="BLUE">
                    <block type="move_down">
                      <field name="STEPS">12</field>
                    </block>
                  </statement>
                  <statement name="GREEN">
                    <block type="move_down">
                      <field name="STEPS">12</field>
                    </block>
                  </statement>
                </block>
              </next>
            </block>
          </statement>
          <statement name="GREEN">
            <block type="move_down">
              <field name="STEPS">18</field>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>`
}

export default level09
