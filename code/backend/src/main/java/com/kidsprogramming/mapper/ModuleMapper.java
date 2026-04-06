package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.Module;
import org.apache.ibatis.annotations.Mapper;

/**
 * 编程模块 Mapper 接口
 */
@Mapper
public interface ModuleMapper extends BaseMapper<Module> {
}
