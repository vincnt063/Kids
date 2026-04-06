package com.kidsprogramming.service;

import com.kidsprogramming.dto.DashboardDataDto;
import com.kidsprogramming.dto.SiteStatsDto;

/**
 * 站点统计服务接口
 */
public interface StatisticsService {

    /**
     * 获取公开站点统计
     *
     * @return 统计信息
     */
    SiteStatsDto getSiteStats();

    /**
     * 获取后台控制台数据
     *
     * @return 后台控制台数据
     */
    DashboardDataDto getDashboardData();
}
