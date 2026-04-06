package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.kidsprogramming.entity.Character;
import com.kidsprogramming.mapper.CharacterMapper;
import com.kidsprogramming.service.CharacterService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharacterServiceImpl extends ServiceImpl<CharacterMapper, Character> implements CharacterService {

    @Override
    public List<Character> getAvailableCharacters() {
        LambdaQueryWrapper<Character> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Character::getStatus, 1)
                .orderByAsc(Character::getSortOrder)
                .orderByAsc(Character::getId);
        return this.list(wrapper);
    }

    @Override
    public List<Character> getCharactersByLevel(Integer userLevel) {
        int safeLevel = Math.max(1, userLevel == null ? 1 : userLevel);

        return getAvailableCharacters().stream()
                .filter(character -> resolveUnlockLevel(character.getUnlockCondition()) <= safeLevel)
                .toList();
    }

    private int resolveUnlockLevel(String unlockCondition) {
        if (unlockCondition == null || unlockCondition.isBlank()) {
            return 1;
        }

        if (unlockCondition.startsWith("level_")) {
            try {
                return Math.max(1, Integer.parseInt(unlockCondition.substring("level_".length())));
            } catch (NumberFormatException ignored) {
                return 1;
            }
        }

        return 1;
    }
}
