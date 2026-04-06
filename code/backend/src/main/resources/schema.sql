CREATE DATABASE IF NOT EXISTS `kids_programming`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `kids_programming`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `learning_record`;
DROP TABLE IF EXISTS `parent_student_binding`;
DROP TABLE IF EXISTS `progress`;
DROP TABLE IF EXISTS `program_case`;
DROP TABLE IF EXISTS `module`;
DROP TABLE IF EXISTS `character`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'child',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `level` INT NOT NULL DEFAULT 1,
  `status` TINYINT NOT NULL DEFAULT 1,
  `email` VARCHAR(100) DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE `parent_student_binding` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parent_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_parent_student_binding` (`parent_id`, `student_id`),
  KEY `idx_parent_student_parent_id` (`parent_id`),
  KEY `idx_parent_student_student_id` (`student_id`),
  CONSTRAINT `fk_parent_student_parent` FOREIGN KEY (`parent_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_parent_student_student` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家长绑定学生关系表';

CREATE TABLE `character` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `walk_image` VARCHAR(255) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `unlock_condition` VARCHAR(50) DEFAULT 'level_1',
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_character_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE `module` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `color` VARCHAR(20) DEFAULT NULL,
  `block_definition` TEXT,
  `config` TEXT,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积木模块表';

CREATE TABLE `program_case` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `difficulty` VARCHAR(20) NOT NULL DEFAULT 'easy',
  `cover` VARCHAR(255) DEFAULT NULL,
  `character` VARCHAR(50) NOT NULL DEFAULT 'cat',
  `initial_workspace` TEXT,
  `target_description` TEXT,
  `hint` TEXT,
  `case_config` JSON DEFAULT NULL,
  `min_stars` INT NOT NULL DEFAULT 1,
  `status` TINYINT NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教学关卡表';

CREATE TABLE `progress` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `total_cases` INT NOT NULL DEFAULT 0,
  `total_time` INT NOT NULL DEFAULT 0,
  `total_works` INT NOT NULL DEFAULT 0,
  `current_level` INT NOT NULL DEFAULT 1,
  `total_points` INT NOT NULL DEFAULT 0,
  `last_login_time` DATETIME DEFAULT NULL,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_progress_user_id` (`user_id`),
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习进度表';

CREATE TABLE `learning_record` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `case_id` INT DEFAULT NULL,
  `work_name` VARCHAR(200) NOT NULL DEFAULT '我的作品',
  `workspace_xml` LONGTEXT,
  `workspace_json` LONGTEXT,
  `result` VARCHAR(255) DEFAULT NULL,
  `screenshot` VARCHAR(255) DEFAULT NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `stars` INT NOT NULL DEFAULT 0,
  `status` TINYINT NOT NULL DEFAULT 1,
  `likes` INT NOT NULL DEFAULT 0,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_learning_user_id` (`user_id`),
  KEY `idx_learning_case_id` (`case_id`),
  CONSTRAINT `fk_learning_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_learning_case` FOREIGN KEY (`case_id`) REFERENCES `program_case` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作品记录表';

INSERT INTO `character`
(`id`, `name`, `code`, `image`, `walk_image`, `description`, `unlock_condition`, `sort_order`, `status`)
VALUES
(1, '小猫', 'cat', 'https://api.iconify.design/noto:cat.svg', NULL, '默认角色', 'level_1', 1, 1),
(2, '小狗', 'dog', 'https://api.iconify.design/noto:dog.svg', NULL, '可爱的小狗', 'level_1', 2, 1),
(3, '企鹅', 'penguin', 'https://api.iconify.design/noto:penguin.svg', NULL, '冰雪探险家', 'level_1', 3, 1),
(4, '机器人', 'robot', 'https://api.iconify.design/noto:robot.svg', NULL, '编程实验角色', 'level_1', 4, 1),
(5, '熊猫', 'panda', 'https://api.iconify.design/noto:panda-face.svg', NULL, '奖励角色', 'level_2', 5, 1);

INSERT INTO `module`
(`id`, `name`, `type`, `icon`, `color`, `block_definition`, `config`, `sort_order`, `status`)
VALUES
(1, '当绿旗被点击', 'event', NULL, '#FFBF00', NULL, NULL, 1, 1),
(2, '向上移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 2, 1),
(3, '向下移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 3, 1),
(4, '向左移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 4, 1),
(5, '向右移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 5, 1),
(6, '向前移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 6, 1),
(7, '向后移动', 'motion', NULL, '#4A7FC8', NULL, NULL, 7, 1),
(8, '左转', 'motion', NULL, '#4A7FC8', NULL, NULL, 8, 1),
(9, '右转', 'motion', NULL, '#4A7FC8', NULL, NULL, 9, 1),
(10, '移到坐标', 'motion', NULL, '#4A7FC8', NULL, NULL, 10, 1),
(11, '重复执行', 'control', NULL, '#FFAB19', NULL, NULL, 11, 1),
(12, '重复直到', 'control', NULL, '#FFAB19', NULL, NULL, 12, 1),
(13, '如果否则', 'control', NULL, '#FFAB19', NULL, NULL, 13, 1),
(14, '根据信号选择', 'control', NULL, '#FFAB19', NULL, NULL, 14, 1),
(15, '方向能走', 'condition', NULL, '#58B368', NULL, NULL, 15, 1),
(16, '碰到障碍物', 'condition', NULL, '#58B368', NULL, NULL, 16, 1),
(17, '等待', 'control', NULL, '#FFAB19', NULL, NULL, 17, 1);

INSERT INTO `program_case`
(`id`, `title`, `description`, `difficulty`, `cover`, `character`, `initial_workspace`, `target_description`, `hint`, `min_stars`, `status`, `sort_order`)
VALUES
(1, '关卡 1：小猫回家', '使用上下左右移动积木帮助角色回家。', 'easy', NULL, 'cat',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="move_right"></block></next></block></xml>',
'让角色到达舞台右侧房子。', '先试试上下左右，再拼出回家的路线。', 1, 1, 1),
(2, '关卡 2：收集星星', '用向前移动和转向积木收集三颗星星。', 'easy', NULL, 'cat',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="move_forward"><next><block type="turn_left"></block></next></block></next></block></xml>',
'收集舞台上的三颗星星。', '先往上走，再转向更容易。', 2, 1, 2),
(3, '关卡 3：避开障碍', '绕开障碍物并到达右侧终点。', 'medium', NULL, 'cat',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="move_forward"><next><block type="turn_left"></block></next></block></next></block></xml>',
'避开障碍，到达目标旗子。', '先规划路线，再调整转向。', 2, 1, 3),
(4, '关卡 4：认识坐标', '使用移到 x:y 积木把角色送到目标坐标。', 'easy', NULL, 'robot',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="goto_xy"><value name="X"><shadow type="math_number"><field name="NUM">40</field></shadow></value><value name="Y"><shadow type="math_number"><field name="NUM">24</field></shadow></value></block></next></block></xml>',
'把角色移动到目标坐标点附近。', '把 x 和 y 改成更接近目标的位置。', 1, 1, 4),
(5, '关卡 5：画一个正方形', '用重复和右转让角色绕一圈。', 'medium', NULL, 'cat',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="move_forward"><next><block type="turn_right"></block></next></block></statement></block></next></block></xml>',
'围着方形路线走一圈，并尽量回到起点。', '把一个边角动作放进重复里。', 3, 1, 5),
(6, '关卡 6：循环收集站', '使用重复积木收集一排星星。', 'medium', NULL, 'dog',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="move_right"></block></statement></block></next></block></xml>',
'收集 4 颗排成一列的星星，并使用重复积木。', '同样的动作不要手写四遍。', 3, 1, 6),
(7, '关卡 7：嵌套循环星阵', '使用嵌套循环收集两排星星。', 'hard', NULL, 'robot',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">2</field></shadow></value><statement name="DO"><block type="repeat"><value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="move_right"></block></statement><next><block type="move_down"><next><block type="move_left"><field name="STEPS">30</field></block></next></block></next></block></statement></block></next></block></xml>',
'收集 6 颗星星，并至少使用两层循环。', '把一个重复放进另一个重复里。', 3, 1, 7),
(8, '关卡 8：先判断再行动', '用 if / else 和方向判断绕开障碍。', 'hard', NULL, 'penguin',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="if_else"><value name="CONDITION"><block type="path_clear"><field name="DIRECTION">right</field><value name="STEPS"><shadow type="math_number"><field name="NUM">20</field></shadow></value></block></value><statement name="DO"><block type="move_right"><field name="STEPS">48</field></block></statement><statement name="ELSE"><block type="move_down"><field name="STEPS">24</field><next><block type="move_right"><field name="STEPS">48</field></block></next></block></statement></block></next></block></xml>',
'到达终点，并真正使用判断逻辑。', '先判断右边能不能走，再决定路线。', 3, 1, 8),
(9, '关卡 9：信号分流站', '根据信号颜色进入不同分支。', 'hard', NULL, 'robot',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">36</field></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">36</field><next><block type="move_right"><field name="STEPS">36</field></block></next></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">12</field></block></statement></block></next></block></xml>',
'到达终点，并使用信号分支。', '先看当前信号，再把路线写进正确分支。', 3, 1, 9),
(10, '关卡 10：等绿灯再出发', '先等待，再根据信号分支前进。', 'hard', NULL, 'robot',
'<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" x="36" y="34"><next><block type="wait_seconds"><value name="SECONDS"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="switch_signal"><statement name="RED"><block type="move_right"><field name="STEPS">36</field></block></statement><statement name="BLUE"><block type="move_down"><field name="STEPS">12</field></block></statement><statement name="GREEN"><block type="move_down"><field name="STEPS">36</field><next><block type="move_right"><field name="STEPS">36</field></block></next></block></statement></block></next></block></next></block></xml>',
'到达终点，并使用等待与信号分支。', '先等 1 秒，让红灯变绿灯，再进入绿色分支。', 3, 1, 10);

INSERT INTO `user`
(`id`, `username`, `password`, `role`, `avatar`, `points`, `level`, `status`, `email`)
VALUES
(1, 'admin_demo', 'admin123', 'admin', NULL, 0, 1, 1, 'admin_demo@example.com'),
(2, 'parent_demo', 'parent123', 'parent', NULL, 0, 1, 1, 'parent_demo@example.com'),
(3, 'all_pass_demo', '123456', 'child', NULL, 300, 6, 1, 'all_pass_demo@example.com');

INSERT INTO `parent_student_binding`
(`id`, `parent_id`, `student_id`)
VALUES
(1, 2, 3);

INSERT INTO `progress`
(`id`, `user_id`, `total_cases`, `total_time`, `total_works`, `current_level`, `total_points`, `last_login_time`)
VALUES
(1, 1, 0, 0, 0, 1, 0, NOW()),
(2, 2, 0, 0, 0, 1, 0, NOW()),
(3, 3, 10, 358, 10, 6, 300, NOW());

INSERT INTO `learning_record`
(`id`, `user_id`, `case_id`, `work_name`, `workspace_xml`, `workspace_json`, `result`, `screenshot`, `duration`, `stars`, `status`, `likes`)
VALUES
(1, 3, 1, '关卡1通关作品', NULL, NULL, '成功到达终点', NULL, 35, 3, 1, 0),
(2, 3, 2, '关卡2通关作品', NULL, NULL, '成功收集全部星星', NULL, 42, 3, 1, 0),
(3, 3, 3, '关卡3通关作品', NULL, NULL, '成功避开障碍并到达终点', NULL, 51, 3, 1, 0),
(4, 3, 4, '关卡4通关作品', NULL, NULL, '成功到达目标坐标', NULL, 28, 3, 1, 0),
(5, 3, 5, '关卡5通关作品', NULL, NULL, '成功完成正方形路径', NULL, 54, 3, 1, 0),
(6, 3, 6, '关卡6通关作品', NULL, NULL, '成功使用循环收集星星', NULL, 26, 3, 1, 0),
(7, 3, 7, '关卡7通关作品', NULL, NULL, '成功使用嵌套循环完成任务', NULL, 38, 3, 1, 0),
(8, 3, 8, '关卡8通关作品', NULL, NULL, '成功使用 if else 绕开障碍', NULL, 31, 3, 1, 0),
(9, 3, 9, '关卡9通关作品', NULL, NULL, '成功根据信号选择正确分支', NULL, 29, 3, 1, 0),
(10, 3, 10, '关卡10通关作品', NULL, NULL, '成功等待绿灯后通过', NULL, 24, 3, 1, 0);

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

SET FOREIGN_KEY_CHECKS = 1;
