package com.kidsprogramming.dto;

import com.kidsprogramming.entity.Progress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 家长视角下的学生学习概览
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentStudentOverviewDto {

    private Integer bindingId;

    private Integer studentId;

    private String studentUsername;

    private Integer status;

    private Progress progress;

    private List<CaseProgressDto> caseProgress;

    private List<LearningRecordSummaryDto> records;
}
