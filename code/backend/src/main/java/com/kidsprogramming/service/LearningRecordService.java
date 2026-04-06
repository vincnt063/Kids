package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.entity.LearningRecord;

import java.util.List;

/**
 * 学习记录服务接口
 */
public interface LearningRecordService extends IService<LearningRecord> {

    /**
     * 获取用户的学习记录
     * @param userId 用户 ID
     * @return 学习记录列表
     */
    List<LearningRecord> getUserRecords(Integer userId);

    /**
     * 保存学习记录
     * @param record 学习记录
     * @return 是否成功
     */
    boolean saveRecord(LearningRecord record);

    /**
     * 获取用户的作品数量
     * @param userId 用户 ID
     * @return 作品数量
     */
    int getUserWorksCount(Integer userId);
}
