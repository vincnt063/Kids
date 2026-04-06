package com.kidsprogramming.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 单关进度 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaseProgressDto {

    /**
     * 关卡 ID
     */
    private Integer caseId;

    /**
     * 是否完成
     */
    private Boolean completed;

    /**
     * 当前最高星级
     */
    private Integer stars;

    /**
     * 关卡标题
     */
    private String title;

    /**
     * 完成时间戳（毫秒）
     */
    private Long completedAt;
}
