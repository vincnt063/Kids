package com.kidsprogramming.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.kidsprogramming.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 用户 Mapper 接口
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM user WHERE TRIM(username) = #{username} LIMIT 1")
    User findByUsername(String username);

    /**
     * 根据邮箱查询用户
     */
    @Select("SELECT * FROM user WHERE LOWER(TRIM(email)) = #{email} LIMIT 1")
    User findByEmail(String email);
}
