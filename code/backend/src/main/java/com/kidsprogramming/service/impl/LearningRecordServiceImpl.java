package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.kidsprogramming.entity.LearningRecord;
import com.kidsprogramming.mapper.LearningRecordMapper;
import com.kidsprogramming.service.LearningRecordService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 学习记录服务实现类
 */
@Service
public class LearningRecordServiceImpl extends ServiceImpl<LearningRecordMapper, LearningRecord> implements LearningRecordService {

    @Override
    public List<LearningRecord> getUserRecords(Integer userId) {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
               .eq(LearningRecord::getStatus, 0)
               .orderByDesc(LearningRecord::getUpdateTime)
               .orderByDesc(LearningRecord::getCreateTime)
               .orderByDesc(LearningRecord::getId);
        return this.list(wrapper);
    }

    @Override
    public boolean saveRecord(LearningRecord record) {
        if (record.getStatus() == null) {
            record.setStatus(0);
        }
        if (record.getLikes() == null) {
            record.setLikes(0);
        }
        if (record.getDuration() == null) {
            record.setDuration(0);
        }
        if (record.getStars() == null) {
            record.setStars(0);
        }
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());
        return this.save(record);
    }

    @Override
    public int getUserWorksCount(Integer userId) {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
               .eq(LearningRecord::getStatus, 0);
        return (int) this.count(wrapper);
    }
}
