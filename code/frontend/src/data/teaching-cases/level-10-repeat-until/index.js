const level10 = {
  id: 10,
  title: '关卡 10：等绿灯再出发',
  shortTitle: '等待 + switch',
  description: '程序有时不能立刻执行，而要先等待一会儿，再根据当前信号进入不同分支。',
  goal: '到达终点，并至少用 1 个“等待”和 1 个“根据当前信号选择”积木。',
  helperText: '先等待 1 秒，让红灯变成绿灯，再把路线写进绿色分支里。',
  taskSteps: ['先等待 1 秒，让信号从红灯变成绿灯', '把“向后移动 36 格，再向右移动 36 格”写进绿色分支', '点击运行，确认程序先等灯再进入绿色分支到终点'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'wait_seconds', 'switch_signal'],
  focusBlocks: ['等待', 'switch 选择', '向右移动', '向后移动'],
  difficulty: 'hard',
  difficultyLabel: '时序分支',
  minStars: 3,
  coverEmoji: '🚦',
  knowledgePoints: ['等待', '时序控制', 'switch 选择'],
  character: 'robot',
  backgroundId: 'school',
  stage: {
    signal: 'red',
    signalTimeline: [
      { afterWaitMs: 0, signal: 'red' },
      { afterWaitMs: 1000, signal: 'green' }
    ],
    start: { x: 12, y: 12, direction: 3 },
    target: { x: 48, y: 48, icon: '🏁', label: '终点' },
    stars: [],
    obstacles: []
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 9,
    requiredWaitBlocks: 1,
    requiredSwitchBlocks: 1,
    waitHint: '这关要先等绿灯亮起，再让程序出发。',
    switchHint: '把路线写进“根据当前信号选择”的绿色分支里。',
    successMessage: '你已经先等待，再根据绿灯选择正确分支，顺利到达终点了。'
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="wait_seconds">
          <value name="SECONDS">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <next>
            <block type="switch_signal">
              <statement name="RED">
                <block type="move_right">
                  <field name="STEPS">36</field>
                </block>
              </statement>
              <statement name="BLUE">
                <block type="move_down">
                  <field name="STEPS">12</field>
                </block>
              </statement>
              <statement name="GREEN">
                <block type="move_down">
                  <field name="STEPS">36</field>
                  <next>
                    <block type="move_right">
                      <field name="STEPS">36</field>
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

export default level10
