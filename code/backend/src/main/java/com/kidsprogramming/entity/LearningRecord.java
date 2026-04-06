package com.kidsprogramming.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 学习记录实体类
 */
@Data
@TableName("learning_record")
public class LearningRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 记录 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户 ID
     */
    private Integer userId;

    /**
     * 案例 ID
     */
    private Integer caseId;

    /**
     * 作品名称
     */
    private String workName;

    /**
     * 程序结构 (Blockly XML)
     */
    private String workspaceXml;

    /**
     * 程序结构 (JSON 格式，备用)
     */
    private String workspaceJson;

    /**
     * 运行结果描述
     */
    private String result;

    /**
     * 截图 URL
     */
    private String screenshot;

    /**
     * 耗时 (秒)
     */
    private Integer duration;

    /**
     * 获得星星数 (0-3)
     */
    private Integer stars;

    /**
     * 状态：1-公开，0-私有
     */
    private Integer status;

    /**
     * 点赞数
     */
    private Integer likes;

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
