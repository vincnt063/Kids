USE `kids_programming`;

SET @has_case_config = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'program_case'
    AND COLUMN_NAME = 'case_config'
);

SET @ddl = IF(@has_case_config = 0, 'ALTER TABLE `program_case` ADD COLUMN `case_config` JSON NULL COMMENT ''关卡运行配置(JSON)'' AFTER `hint`', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"小猫回家","goal":"让小猫到达舞台右下方的房子。","tip":"先试试前后左右四个方向怎么走，再拼出一条能回家的路线。","helperText":"把移动积木接到“点击开始”下方，前后左右都可以试一试。","taskSteps":["把“向右移动”接到“点击开始”下方","把距离调到 50 格左右","点击开始，让小猫走到房子旁边"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right"],"focusBlocks":["向前移动","向后移动","向左移动","向右移动"],"difficultyLabel":"热身关","coverEmoji":"🏠","knowledgePoints":["顺序执行","基础移动"],"backgroundId":"school","stage":{"start":{"x":8,"y":44,"direction":3},"target":{"x":57,"y":42,"icon":"🏠","label":"家"},"stars":[],"obstacles":[]},"evaluation":{"type":"reach-target","tolerance":9}}',
    `update_time` = NOW()
WHERE `id` = 1;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"收集星星","goal":"收集舞台上的 3 颗星星。","tip":"先往前走，再拐弯，会更容易碰到上方的星星。","helperText":"这关主要用“向前移动”“向左转”“向右转”。","taskSteps":["先向左转，让角色朝向第一颗星","向前移动 26 格，再向右转","再向前移动两次，把后面两颗星也碰到"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right"],"focusBlocks":["向前移动","向左转","向右转"],"difficultyLabel":"观察关","coverEmoji":"⭐","knowledgePoints":["转向","路线规划"],"backgroundId":"forest","stage":{"start":{"x":10,"y":45,"direction":0},"target":null,"stars":[{"id":"star-a","x":16,"y":22,"icon":"⭐"},{"id":"star-b","x":36,"y":15,"icon":"⭐"},{"id":"star-c","x":56,"y":28,"icon":"⭐"}],"obstacles":[]},"evaluation":{"type":"collect-stars","starTolerance":8}}',
    `update_time` = NOW()
WHERE `id` = 2;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"避开障碍","goal":"绕开整条路障，到达目标旗子。","tip":"这不是一个点状障碍，直冲过去一定会撞上，先转向绕开，再回到终点路线。","helperText":"先让角色转向，绕开整条路障，再横着去终点。","taskSteps":["先向左转，再向前移动 31 格绕到路障上方","向右转后向前移动 50 格，从外侧穿过去","再向右转，向前移动 26 格到终点"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right"],"focusBlocks":["向前移动","向左转","向右转"],"difficultyLabel":"挑战关","coverEmoji":"🚧","knowledgePoints":["路径规划","组合动作"],"backgroundId":"default","stage":{"start":{"x":8,"y":44,"direction":0},"target":{"x":58,"y":40,"icon":"🏁","label":"终点"},"stars":[],"obstacles":[{"id":"barrier-line","type":"line","x1":34,"y1":26,"x2":34,"y2":58,"thickness":2,"icon":"🚧"}]},"evaluation":{"type":"avoid-obstacle","tolerance":9,"detour":{"maxY":16,"minY":58}}}',
    `update_time` = NOW()
WHERE `id` = 3;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"认识坐标","goal":"把小猫移动到坐标点附近。","tip":"先看右侧舞台里的目标点，再把 x 和 y 改得更接近它。","helperText":"这关会用到“移到 x:y”，数字改一改就能看到变化。","taskSteps":["找到“移到 x:y”积木","先把 x 改到 40 左右，y 改到 24 左右","点击运行，再按结果微调到目标点附近"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","goto_xy"],"focusBlocks":["移到 x:y","数字"],"difficultyLabel":"探索关","coverEmoji":"📍","knowledgePoints":["坐标","精确定位"],"backgroundId":"space","stage":{"start":{"x":8,"y":45,"direction":3},"target":{"x":42,"y":24,"icon":"📍","label":"目标坐标"},"stars":[],"obstacles":[]},"evaluation":{"type":"reach-target","tolerance":7}}',
    `update_time` = NOW()
WHERE `id` = 4;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"画正方形","goal":"围着方形路线走一圈，尽量回到起点附近。","tip":"如果你能让角色回到出发点，而且用到了“重复”，说明你已经很会整理步骤了。","helperText":"先写一段“向前移动 + 转弯”，再把它放进“重复”里。","taskSteps":["先写一组“向前移动 10 格 + 向右转”","把这组动作放进“重复”里","把次数设成 4，让角色绕一圈回到起点附近"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","repeat"],"focusBlocks":["向前移动","向右转","重复"],"difficultyLabel":"创作关","coverEmoji":"⬜","knowledgePoints":["重复","模式识别"],"backgroundId":"rainbow","stage":{"start":{"x":24,"y":38,"direction":0},"target":null,"stars":[],"obstacles":[],"guidePoints":[{"id":"p1","x":24,"y":38},{"id":"p2","x":46,"y":38},{"id":"p3","x":46,"y":20},{"id":"p4","x":24,"y":20}]},"evaluation":{"type":"square-path","minDistance":36,"maxDistanceToStart":9}}',
    `update_time` = NOW()
WHERE `id` = 5;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"循环收集","goal":"收集 4 颗排成一列的星星，并至少使用 1 个重复积木。","tip":"如果同样的动作要做 4 次，就不要手写 4 遍，把它放进“重复”。这一关每次要走得稍远一点。","helperText":"先向后移动 40 格对齐星星，再把“向右移动 15 格”放进“重复”里。","taskSteps":["先向后移动 40 格，对齐第一颗星","把“向右移动 15 格”放进“重复”里","把次数设成 3，连续收完这一排星星"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","repeat"],"focusBlocks":["向右移动","重复"],"difficultyLabel":"算法关","coverEmoji":"🔁","knowledgePoints":["循环","消除重复"],"backgroundId":"school","stage":{"start":{"x":20,"y":30,"direction":3},"target":null,"stars":[{"id":"loop-star-a","x":15,"y":73,"icon":"⭐"},{"id":"loop-star-b","x":31,"y":73,"icon":"⭐"},{"id":"loop-star-c","x":48,"y":73,"icon":"⭐"},{"id":"loop-star-d","x":65,"y":73,"icon":"⭐"}],"obstacles":[]},"evaluation":{"type":"collect-stars","starTolerance":8,"requiredRepeatBlocks":1,"repeatHint":"这关要把重复动作收进“重复”积木里，别一格一格手写。"}}',
    `update_time` = NOW()
WHERE `id` = 6;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"嵌套循环","goal":"收集 6 颗星星，并至少用出 1 层嵌套循环。","tip":"先在里面的“重复”里写一排动作，再用外面的“重复”控制做两排。这关要把移动距离调大一点。","helperText":"先向前移动 53 格对齐第一排星星，再用“重复里面再放重复”完成两排路线。","taskSteps":["先向前移动 53 格，到第一排星星旁边","内层“重复”设成 3 次，每次向右移动 20 格","外层“重复”设成 2 次，每排结束后向后 15 格，再向左 60 格回到起点"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","repeat"],"focusBlocks":["向右移动","向左移动","向后移动","重复"],"difficultyLabel":"进阶编程关","coverEmoji":"🧠","knowledgePoints":["嵌套循环","模式抽象"],"backgroundId":"space","stage":{"start":{"x":20,"y":70,"direction":3},"target":null,"stars":[{"id":"grid-a","x":20,"y":20,"icon":"⭐"},{"id":"grid-b","x":40,"y":20,"icon":"⭐"},{"id":"grid-c","x":60,"y":20,"icon":"⭐"},{"id":"grid-d","x":20,"y":35,"icon":"⭐"},{"id":"grid-e","x":40,"y":35,"icon":"⭐"},{"id":"grid-f","x":60,"y":35,"icon":"⭐"}],"obstacles":[]},"evaluation":{"type":"collect-stars","starTolerance":8,"requiredRepeatBlocks":2,"requiredNestedRepeatDepth":2,"repeatHint":"这关至少要用 2 个“重复”积木。","nestedRepeatHint":"把一个“重复”放进另一个“重复”里，这样才算真正的嵌套循环。"}}',
    `update_time` = NOW()
WHERE `id` = 7;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"if 判断","goal":"到达终点，并至少用 1 个“如果否则”和 1 个“方向能走”积木。","helperText":"把“右方能走 20 格”塞进 if 条件里。能走就直走，不能走就先向后移动再向右。","taskSteps":["先把“右方能走 20 格”接进 if 条件","那么里放“向右移动 48 格”","否则里放“向后移动 24 格，再向右移动 48 格”"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","if_else","path_clear"],"focusBlocks":["如果否则","方向能走","向右移动","向后移动"],"difficultyLabel":"判断关","coverEmoji":"🚦","knowledgePoints":["条件判断","if / else"],"backgroundId":"forest","stage":{"start":{"x":10,"y":26,"direction":3},"target":{"x":58,"y":50,"icon":"🏁","label":"终点"},"stars":[],"obstacles":[{"id":"if-wall","type":"line","x1":28,"y1":18,"x2":28,"y2":42,"thickness":2,"icon":"🧱"}]},"evaluation":{"type":"reach-target","tolerance":9,"requiredIfElseBlocks":1,"requiredPathCheckBlocks":1,"ifElseHint":"这关要先判断再行动，至少放 1 个“如果否则”积木。","pathCheckHint":"把“方向能走”接进 if 条件里，程序才是在真的做判断。","successMessage":"你已经让程序先判断右方能不能走，再决定怎么走了。"}}',
    `update_time` = NOW()
WHERE `id` = 8;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"switch 选择","goal":"到达终点，并至少用 3 个“根据当前信号选择”积木。","helperText":"先看当前信号，再每移动一次就重新判断一次。第一个信号是蓝色，移动一次会变红色，再移动一次会变绿色。","taskSteps":["先放第一个“根据当前信号选择”，在蓝色分支里向后移动 18 格","再接第二个“根据当前信号选择”，等信号变成红色后向右移动 36 格","最后接第三个“根据当前信号选择”，等信号变成绿色后再向后移动 18 格到终点"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","switch_signal"],"focusBlocks":["switch 选择","向右移动","向后移动"],"difficultyLabel":"分支关","coverEmoji":"🎛️","knowledgePoints":["switch 选择","多分支程序"],"backgroundId":"space","stage":{"signal":"blue","signalMoveSequence":[{"afterMoveCount":0,"signal":"blue"},{"afterMoveCount":1,"signal":"red"},{"afterMoveCount":2,"signal":"green"}],"start":{"x":12,"y":12,"direction":3},"target":{"x":48,"y":48,"icon":"🏁","label":"终点"},"stars":[],"obstacles":[]},"evaluation":{"type":"reach-target","tolerance":9,"requiredSwitchBlocks":3,"switchHint":"这关要连续用 3 次“根据当前信号选择”，跟着蓝色、红色、绿色依次换分支。","successMessage":"你已经跟着蓝色、红色、绿色三个信号依次选对分支，顺利到达目标。"}}',
    `update_time` = NOW()
WHERE `id` = 9;

UPDATE `program_case`
SET `case_config` = '{"shortTitle":"等待 + switch","goal":"到达终点，并至少用 1 个“等待”和 1 个“根据当前信号选择”积木。","helperText":"先等待 1 秒，让红灯变成绿灯，再把路线写进绿色分支里。","taskSteps":["先等待 1 秒，让信号从红灯变成绿灯","把“向后移动 36 格，再向右移动 36 格”写进绿色分支","点击运行，确认程序先等灯再进入绿色分支到终点"],"availableBlocks":["move_up","move_down","move_left","move_right","turn_left","turn_right","wait_seconds","switch_signal"],"focusBlocks":["等待","switch 选择","向右移动","向后移动"],"difficultyLabel":"时序分支","coverEmoji":"🚦","knowledgePoints":["等待","时序控制","switch 选择"],"backgroundId":"school","stage":{"signal":"red","signalTimeline":[{"afterWaitMs":0,"signal":"red"},{"afterWaitMs":1000,"signal":"green"}],"start":{"x":12,"y":12,"direction":3},"target":{"x":48,"y":48,"icon":"🏁","label":"终点"},"stars":[],"obstacles":[]},"evaluation":{"type":"reach-target","tolerance":9,"requiredWaitBlocks":1,"requiredSwitchBlocks":1,"waitHint":"这关要先等绿灯亮起，再让程序出发。","switchHint":"把路线写进“根据当前信号选择”的绿色分支里。","successMessage":"你已经先等待，再根据绿灯选择正确分支，顺利到达终点了。"}}',
    `update_time` = NOW()
WHERE `id` = 10;
