package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户实体类
 */
@Data
@TableName("user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码 (加密)
     */
    private String password;

    /**
     * 角色：child-学生，parent-家长，admin-管理员
     */
    private String role;

    /**
     * 头像 URL
     */
    private String avatar;

    /**
     * 积分
     */
    private Integer points;

    /**
     * 等级
     */
    private Integer level;

    /**
     * 状态：1-正常，0-冻结
     */
    private Integer status;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 注册时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
