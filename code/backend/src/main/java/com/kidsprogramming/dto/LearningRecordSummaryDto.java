package com.kidsprogramming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 学习记录摘要
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningRecordSummaryDto {

    private Integer id;

    private Integer caseId;

    private String workName;

    private String result;

    private Integer duration;

    private Integer stars;

    private String createTime;

    private String updateTime;
}
