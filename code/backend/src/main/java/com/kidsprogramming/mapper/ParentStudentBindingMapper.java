package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.ParentStudentBinding;
import org.apache.ibatis.annotations.Mapper;

/**
 * 家长与学生绑定关系 Mapper
 */
@Mapper
public interface ParentStudentBindingMapper extends BaseMapper<ParentStudentBinding> {
}
