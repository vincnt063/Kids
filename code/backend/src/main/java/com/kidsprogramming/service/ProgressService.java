package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.dto.CaseProgressDto;
import com.kidsprogramming.entity.Progress;

import java.util.List;

/**
 * 学习进度服务接口
 */
public interface ProgressService extends IService<Progress> {

    /**
     * 获取用户的学习进度
     * @param userId 用户 ID
     * @return 学习进度
     */
    Progress getUserProgress(Integer userId);

    /**
     * 获取用户的关卡进度
     * @param userId 用户 ID
     * @return 单关进度列表
     */
    List<CaseProgressDto> getUserCaseProgress(Integer userId);

    /**
     * 更新用户进度
     * @param userId 用户 ID
     * @param caseId 案例 ID
     * @param stars 获得的星星数
     */
    void updateProgress(Integer userId, Integer caseId, Integer stars);
}
