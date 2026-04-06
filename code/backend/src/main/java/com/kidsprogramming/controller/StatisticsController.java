package com.kidsprogramming.controller;

import com.kidsprogramming.dto.DashboardDataDto;
import com.kidsprogramming.dto.Result;
import com.kidsprogramming.dto.SiteStatsDto;
import com.kidsprogramming.service.StatisticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 站点统计控制器
 */
@Slf4j
@RestController
@RequestMapping("/stats")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * 获取公开站点统计
     */
    @GetMapping("/overview")
    public Result<SiteStatsDto> getOverview() {
        try {
            return Result.success(statisticsService.getSiteStats());
        } catch (Exception e) {
            log.error("获取站点统计失败", e);
            return Result.error("获取站点统计失败：" + e.getMessage());
        }
    }

    /**
     * 获取后台控制台数据
     */
    @GetMapping("/dashboard")
    public Result<DashboardDataDto> getDashboardData() {
        try {
            return Result.success(statisticsService.getDashboardData());
        } catch (Exception e) {
            log.error("获取后台控制台数据失败", e);
            return Result.error("获取后台控制台数据失败：" + e.getMessage());
        }
    }
}
