package com.kidsprogramming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 站点统计信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteStatsDto {

    private Long userCount;

    private Long caseCount;

    private Long activeCaseCount;

    private Long moduleCount;

    private Long activeModuleCount;

    private Long recordCount;

    private Long characterCount;

    private Long totalStarsEarned;

    private Long completedUserCount;
}
