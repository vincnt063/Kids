const level03 = {
  id: 3,
  title: '关卡 3：避开障碍',
  shortTitle: '避开障碍',
  description: '舞台中间是一整条拦路线，先转向绕过去，再到达前方终点。',
  goal: '绕开整条路障，到达目标旗子。',
  tip: '这不是一个点状障碍，直冲过去一定会撞上，先转向绕开，再回到终点路线。',
  helperText: '先让角色转向，绕开整条路障，再横着去终点。',
  taskSteps: ['先向左转，再向前移动 31 格绕到路障上方', '向右转后向前移动 50 格，从外侧穿过去', '再向右转，向前移动 26 格到终点'],
  availableBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'turn_left', 'turn_right'],
  focusBlocks: ['向前移动', '向左转', '向右转'],
  difficulty: 'medium',
  difficultyLabel: '挑战关',
  minStars: 2,
  coverEmoji: '🚧',
  knowledgePoints: ['路径规划', '组合动作'],
  character: 'cat',
  backgroundId: 'default',
  stage: {
    start: { x: 8, y: 44, direction: 0 },
    target: { x: 58, y: 40, icon: '🏁', label: '终点' },
    stars: [],
    obstacles: [
      { id: 'barrier-line', type: 'line', x1: 34, y1: 26, x2: 34, y2: 58, thickness: 2, icon: '🚧' }
    ]
  },
  evaluation: {
    type: 'avoid-obstacle',
    tolerance: 9,
    detour: {
      maxY: 16,
      minY: 58
    }
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

export default level03
