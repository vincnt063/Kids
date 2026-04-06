package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.kidsprogramming.dto.CaseProgressDto;
import com.kidsprogramming.entity.LearningRecord;
import com.kidsprogramming.entity.ProgramCase;
import com.kidsprogramming.entity.Progress;
import com.kidsprogramming.mapper.LearningRecordMapper;
import com.kidsprogramming.mapper.ProgramCaseMapper;
import com.kidsprogramming.mapper.ProgressMapper;
import com.kidsprogramming.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 学习进度服务实现类
 */
@Service
public class ProgressServiceImpl extends ServiceImpl<ProgressMapper, Progress> implements ProgressService {

    @Autowired
    private LearningRecordMapper learningRecordMapper;

    @Autowired
    private ProgramCaseMapper programCaseMapper;

    @Override
    public Progress getUserProgress(Integer userId) {
        LambdaQueryWrapper<Progress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Progress::getUserId, userId);
        return this.getOne(wrapper);
    }

    @Override
    public List<CaseProgressDto> getUserCaseProgress(Integer userId) {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
                .eq(LearningRecord::getStatus, 1)
                .isNotNull(LearningRecord::getCaseId)
                .orderByAsc(LearningRecord::getCaseId)
                .orderByDesc(LearningRecord::getStars)
                .orderByDesc(LearningRecord::getUpdateTime);

        List<LearningRecord> records = learningRecordMapper.selectList(wrapper);
        Map<Integer, String> caseTitleMap = getCaseTitleMap(records);
        Map<Integer, CaseProgressDto> progressMap = new LinkedHashMap<>();

        for (LearningRecord record : records) {
            Integer caseId = record.getCaseId();
            if (caseId == null) {
                continue;
            }

            Integer stars = Math.max(0, record.getStars() == null ? 0 : record.getStars());
            Long completedAt = toTimestamp(record.getUpdateTime() != null ? record.getUpdateTime() : record.getCreateTime());
            CaseProgressDto existing = progressMap.get(caseId);
            String caseTitle = caseTitleMap.getOrDefault(caseId, "第 " + caseId + " 关");

            if (existing == null || stars > existing.getStars()) {
                progressMap.put(caseId, new CaseProgressDto(caseId, true, stars, caseTitle, completedAt));
            }
        }

        return new ArrayList<>(progressMap.values());
    }

    private Map<Integer, String> getCaseTitleMap(List<LearningRecord> records) {
        Set<Integer> caseIds = new HashSet<>();

        for (LearningRecord record : records) {
            if (record.getCaseId() != null) {
                caseIds.add(record.getCaseId());
            }
        }

        if (caseIds.isEmpty()) {
            return Map.of();
        }

        LambdaQueryWrapper<ProgramCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ProgramCase::getId, caseIds);

        List<ProgramCase> cases = programCaseMapper.selectList(wrapper);
        Map<Integer, String> caseTitleMap = new LinkedHashMap<>();

        for (ProgramCase item : cases) {
            if (item.getId() != null) {
                caseTitleMap.put(item.getId(), item.getTitle());
            }
        }

        return caseTitleMap;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProgress(Integer userId, Integer caseId, Integer stars) {
        if (userId == null || caseId == null || stars == null) {
            throw new IllegalArgumentException("用户、关卡和星级不能为空");
        }

        upsertLearningRecord(userId, caseId, stars);
        refreshUserProgress(userId);
    }

    private int calculateLevel(int totalPoints) {
        if (totalPoints >= 1000) return 10;
        if (totalPoints >= 800) return 9;
        if (totalPoints >= 600) return 8;
        if (totalPoints >= 400) return 7;
        if (totalPoints >= 300) return 6;
        if (totalPoints >= 200) return 5;
        if (totalPoints >= 150) return 4;
        if (totalPoints >= 100) return 3;
        if (totalPoints >= 50) return 2;
        return 1;
    }

    private void upsertLearningRecord(Integer userId, Integer caseId, Integer stars) {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
                .eq(LearningRecord::getCaseId, caseId)
                .eq(LearningRecord::getStatus, 1)
                .orderByDesc(LearningRecord::getStars)
                .orderByDesc(LearningRecord::getUpdateTime)
                .last("LIMIT 1");

        LearningRecord existing = learningRecordMapper.selectOne(wrapper);

        if (existing == null) {
            LearningRecord record = new LearningRecord();
            record.setUserId(userId);
            record.setCaseId(caseId);
            record.setWorkName("关卡 " + caseId + " 通关作品");
            record.setResult("成功完成关卡");
            record.setDuration(0);
            record.setStars(Math.max(0, stars));
            record.setStatus(1);
            record.setLikes(0);
            record.setCreateTime(LocalDateTime.now());
            record.setUpdateTime(LocalDateTime.now());
            learningRecordMapper.insert(record);
            return;
        }

        int nextStars = Math.max(existing.getStars() == null ? 0 : existing.getStars(), Math.max(0, stars));
        existing.setStars(nextStars);
        existing.setResult("成功完成关卡");
        existing.setStatus(existing.getStatus() == null ? 1 : existing.getStatus());
        existing.setUpdateTime(LocalDateTime.now());
        learningRecordMapper.updateById(existing);
    }

    private void refreshUserProgress(Integer userId) {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
                .eq(LearningRecord::getStatus, 1);

        List<LearningRecord> records = learningRecordMapper.selectList(wrapper);
        Map<Integer, Integer> bestStarsByCase = new LinkedHashMap<>();
        int totalTime = 0;

        for (LearningRecord record : records) {
            totalTime += Math.max(0, record.getDuration() == null ? 0 : record.getDuration());

            Integer caseId = record.getCaseId();
            if (caseId == null) {
                continue;
            }

            int stars = Math.max(0, record.getStars() == null ? 0 : record.getStars());
            bestStarsByCase.merge(caseId, stars, Math::max);
        }

        int totalPoints = bestStarsByCase.values().stream().mapToInt(value -> value * 10).sum();
        Progress progress = getUserProgress(userId);

        if (progress == null) {
            progress = new Progress();
            progress.setUserId(userId);
        }

        progress.setTotalCases(bestStarsByCase.size());
        progress.setTotalTime(totalTime);
        progress.setTotalWorks(records.size());
        progress.setTotalPoints(totalPoints);
        progress.setCurrentLevel(calculateLevel(totalPoints));
        progress.setLastLoginTime(LocalDateTime.now());

        if (progress.getId() == null) {
            this.save(progress);
        } else {
            this.updateById(progress);
        }
    }

    private Long toTimestamp(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }

        return dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
}
