package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 学习进度统计实体类
 */
@Data
@TableName("progress")
public class Progress implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 进度 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户 ID
     */
    private Integer userId;

    /**
     * 已完成案例数
     */
    private Integer totalCases;

    /**
     * 总学习时长 (分钟)
     */
    private Integer totalTime;

    /**
     * 作品总数
     */
    private Integer totalWorks;

    /**
     * 当前等级
     */
    private Integer currentLevel;

    /**
     * 总积分
     */
    private Integer totalPoints;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
