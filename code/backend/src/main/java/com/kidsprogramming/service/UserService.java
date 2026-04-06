package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.entity.User;

public interface UserService extends IService<User> {
    User findByUsername(String username);
}
