package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 编程案例实体类
 */
@Data
@TableName("program_case")
public class ProgramCase implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 案例 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 案例标题
     */
    private String title;

    /**
     * 案例描述
     */
    private String description;

    /**
     * 难度等级：easy-简单，medium-中等，hard-困难
     */
    private String difficulty;

    /**
     * 封面图 URL
     */
    private String cover;

    /**
     * 主角：cat-小猫，robot-机器人，penguin-企鹅
     */
    @TableField(value = "`character`")
    private String character;

    /**
     * 初始工作区配置 (Blockly XML)
     */
    private String initialWorkspace;

    /**
     * 目标描述
     */
    private String targetDescription;

    /**
     * 提示信息
     */
    private String hint;

    /**
     * 关卡运行配置 (JSON)
     */
    private String caseConfig;

    /**
     * 最少需要星星数
     */
    private Integer minStars;

    /**
     * 状态：1-上架，0-在库中
     */
    private Integer status;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
