package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 角色实体类（卡通形象）
 */
@Data
@TableName("`character`")
public class Character implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 角色 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 角色名称
     */
    private String name;

    /**
     * 角色代码标识
     */
    private String code;

    /**
     * 角色图片 URL
     */
    private String image;

    /**
     * 行走动画图片
     */
    private String walkImage;

    /**
     * 角色描述
     */
    private String description;

    /**
     * 解锁条件
     */
    private String unlockCondition;

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
}
