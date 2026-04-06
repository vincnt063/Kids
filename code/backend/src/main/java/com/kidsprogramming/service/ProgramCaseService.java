package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.dto.ProgramCaseViewDto;
import com.kidsprogramming.entity.ProgramCase;

import java.util.List;

/**
 * 编程案例服务接口
 */
public interface ProgramCaseService extends IService<ProgramCase> {

    /**
     * 获取所有启用的案例
     * @return 案例列表
     */
    List<ProgramCaseViewDto> getEnabledCases();

    /**
     * 根据难度获取案例
     * @param difficulty 难度等级
     * @return 案例列表
     */
    List<ProgramCaseViewDto> getCasesByDifficulty(String difficulty);

    /**
     * 获取全部案例
     *
     * @return 案例列表
     */
    List<ProgramCaseViewDto> getAllCases();

    /**
     * 获取案例详情
     * @param id 案例 ID
     * @return 案例信息
     */
    ProgramCaseViewDto getCaseById(Integer id);
}
