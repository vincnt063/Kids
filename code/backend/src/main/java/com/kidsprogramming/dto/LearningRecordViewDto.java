package com.kidsprogramming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 后台学习记录视图
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRecordViewDto {

    private Integer id;

    private Integer userId;

    private String userName;

    private Integer caseId;

    private String workName;

    private Integer duration;

    private Integer stars;

    private String createTime;
}
