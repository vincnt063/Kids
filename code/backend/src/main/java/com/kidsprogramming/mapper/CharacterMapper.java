package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.Character;
import org.apache.ibatis.annotations.Mapper;

/**
 * 角色 Mapper 接口
 */
@Mapper
public interface CharacterMapper extends BaseMapper<Character> {
}
