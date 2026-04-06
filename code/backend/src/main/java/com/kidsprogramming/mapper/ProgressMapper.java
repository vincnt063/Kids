package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.Progress;
import org.apache.ibatis.annotations.Mapper;

/**
 * 学习进度 Mapper 接口
 */
@Mapper
public interface ProgressMapper extends BaseMapper<Progress> {
}
