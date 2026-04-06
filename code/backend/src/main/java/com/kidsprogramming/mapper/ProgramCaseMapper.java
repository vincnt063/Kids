package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.ProgramCase;
import org.apache.ibatis.annotations.Mapper;

/**
 * 编程案例 Mapper 接口
 */
@Mapper
public interface ProgramCaseMapper extends BaseMapper<ProgramCase> {
}
