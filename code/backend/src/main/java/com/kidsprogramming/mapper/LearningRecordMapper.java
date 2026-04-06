package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.LearningRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 学习记录 Mapper 接口
 */
@Mapper
public interface LearningRecordMapper extends BaseMapper<LearningRecord> {
}
