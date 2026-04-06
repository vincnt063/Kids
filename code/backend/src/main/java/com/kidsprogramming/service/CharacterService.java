package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.entity.Character;

import java.util.List;

public interface CharacterService extends IService<Character> {

    /**
     * 获取启用中的角色
     * @return 角色列表
     */
    List<Character> getAvailableCharacters();

    /**
     * 根据用户等级获取可解锁角色
     * @param userLevel 用户等级
     * @return 可用角色列表
     */
    List<Character> getCharactersByLevel(Integer userLevel);
}
