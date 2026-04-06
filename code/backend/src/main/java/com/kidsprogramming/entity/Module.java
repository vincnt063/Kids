package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 编程模块实体类
 */
@Data
@TableName("module")
public class Module implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 模块 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 模块名称
     */
    private String name;

    /**
     * 模块类型：motion-运动，looks-外观，control-控制，event-事件，operator-运算
     */
    private String type;

    /**
     * 图标 URL
     */
    private String icon;

    /**
     * 模块颜色
     */
    private String color;

    /**
     * Blockly 块定义 (JSON 格式)
     */
    private String blockDefinition;

    /**
     * 额外配置参数
     */
    private String config;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 状态：1-启用，0-禁用
     */
    private Integer status;

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
