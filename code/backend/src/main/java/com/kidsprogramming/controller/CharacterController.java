package com.kidsprogramming.controller;

import com.kidsprogramming.dto.Result;
import com.kidsprogramming.entity.Character;
import com.kidsprogramming.service.CharacterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色控制器
 */
@Slf4j
@RestController
@RequestMapping("/character")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    /**
     * 获取所有可用角色
     */
    @GetMapping("/list")
    public Result<List<Character>> getAllCharacters() {
        try {
            List<Character> characters = characterService.getAvailableCharacters();
            return Result.success(characters);
        } catch (Exception e) {
            log.error("获取角色列表失败", e);
            return Result.error("获取角色列表失败：" + e.getMessage());
        }
    }

    /**
     * 根据用户等级获取可解锁的角色
     */
    @GetMapping("/unlock/{userLevel}")
    public Result<List<Character>> getUnlockableCharacters(@PathVariable Integer userLevel) {
        try {
            List<Character> characters = characterService.getCharactersByLevel(userLevel);
            return Result.success(characters);
        } catch (Exception e) {
            log.error("获取可解锁角色失败", e);
            return Result.error("获取可解锁角色失败：" + e.getMessage());
        }
    }
}
