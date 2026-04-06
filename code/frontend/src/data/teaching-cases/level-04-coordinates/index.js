const level04 = {
  id: 4,
  title: '关卡 4：认识坐标',
  shortTitle: '认识坐标',
  description: '试试“移到 x:y”积木，直接把小猫送到目标坐标点。',
  goal: '把小猫移动到坐标点附近。',
  tip: '先看右侧舞台里的目标点，再把 x 和 y 改得更接近它。',
  helperText: '这关会用到“移到 x:y”，数字改一改就能看到变化。',
  taskSteps: ['找到“移到 x:y”积木', '先把 x 改到 40 左右，y 改到 24 左右', '点击运行，再按结果微调到目标点附近'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right', 'goto_xy'],
  focusBlocks: ['移到 x:y', '数字'],
  difficulty: 'easy',
  difficultyLabel: '探索关',
  minStars: 1,
  coverEmoji: '📍',
  knowledgePoints: ['坐标', '精确定位'],
  character: 'robot',
  backgroundId: 'space',
  stage: {
    start: { x: 8, y: 45, direction: 3 },
    target: { x: 42, y: 24, icon: '📍', label: '目标坐标' },
    stars: [],
    obstacles: []
  },
  evaluation: {
    type: 'reach-target',
    tolerance: 7
  },
  initialWorkspace: `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="event_start" x="36" y="34">
      <next>
        <block type="goto_xy">
          <value name="X">
            <shadow type="math_number">
              <field name="NUM">40</field>
            </shadow>
          </value>
          <value name="Y">
            <shadow type="math_number">
              <field name="NUM">24</field>
            </shadow>
          </value>
        </block>
      </next>
    </block>
  </xml>`
}

export default level04
