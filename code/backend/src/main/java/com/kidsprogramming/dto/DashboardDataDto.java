package com.kidsprogramming.dto;

import com.kidsprogramming.entity.Module;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 后台控制台数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDataDto {

    private SiteStatsDto stats;

    private List<RecentActivityDto> recentActivities;

    private List<AdminUserDto> users;

    private List<Module> modules;

    private List<ProgramCaseViewDto> cases;

    private List<LearningRecordViewDto> records;
}
