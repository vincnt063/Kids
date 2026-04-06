package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kidsprogramming.dto.AdminUserDto;
import com.kidsprogramming.dto.DashboardDataDto;
import com.kidsprogramming.dto.LearningRecordViewDto;
import com.kidsprogramming.dto.ProgramCaseViewDto;
import com.kidsprogramming.dto.RecentActivityDto;
import com.kidsprogramming.dto.SiteStatsDto;
import com.kidsprogramming.entity.Character;
import com.kidsprogramming.entity.LearningRecord;
import com.kidsprogramming.entity.Module;
import com.kidsprogramming.entity.ProgramCase;
import com.kidsprogramming.entity.Progress;
import com.kidsprogramming.entity.User;
import com.kidsprogramming.mapper.CharacterMapper;
import com.kidsprogramming.mapper.LearningRecordMapper;
import com.kidsprogramming.mapper.ModuleMapper;
import com.kidsprogramming.mapper.ProgramCaseMapper;
import com.kidsprogramming.mapper.ProgressMapper;
import com.kidsprogramming.mapper.UserMapper;
import com.kidsprogramming.service.ProgramCaseService;
import com.kidsprogramming.service.StatisticsService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 站点统计服务实现
 */
@Service
public class StatisticsServiceImpl implements StatisticsService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProgramCaseMapper programCaseMapper;

    @Autowired
    private ModuleMapper moduleMapper;

    @Autowired
    private LearningRecordMapper learningRecordMapper;

    @Autowired
    private CharacterMapper characterMapper;

    @Autowired
    private ProgressMapper progressMapper;

    @Autowired
    private ProgramCaseService programCaseService;

    @Override
    public SiteStatsDto getSiteStats() {
        long userCount = userMapper.selectCount(null);
        long caseCount = programCaseMapper.selectCount(null);
        long activeCaseCount = countEnabledCases();
        long moduleCount = moduleMapper.selectCount(null);
        long activeModuleCount = countEnabledModules();
        long recordCount = learningRecordMapper.selectCount(null);
        long characterCount = characterMapper.selectCount(null);
        long completedUserCount = countCompletedUsers();
        long totalStarsEarned = sumAllStars();

        return SiteStatsDto.builder()
                .userCount(userCount)
                .caseCount(caseCount)
                .activeCaseCount(activeCaseCount)
                .moduleCount(moduleCount)
                .activeModuleCount(activeModuleCount)
                .recordCount(recordCount)
                .characterCount(characterCount)
                .completedUserCount(completedUserCount)
                .totalStarsEarned(totalStarsEarned)
                .build();
    }

    @Override
    public DashboardDataDto getDashboardData() {
        List<User> userEntities = getAllUsers();
        List<ProgramCaseViewDto> cases = programCaseService.getAllCases();
        List<Module> modules = getAllModules();
        List<LearningRecord> recordEntities = getAllRecords();

        Map<Integer, String> userNameMap = userEntities.stream()
                .collect(Collectors.toMap(User::getId, User::getUsername, (left, right) -> left, LinkedHashMap::new));

        Map<Integer, String> caseTitleMap = cases.stream()
                .collect(Collectors.toMap(ProgramCaseViewDto::getId, ProgramCaseViewDto::getTitle, (left, right) -> left, LinkedHashMap::new));

        List<AdminUserDto> users = userEntities.stream()
                .map(this::toAdminUserDto)
                .collect(Collectors.toList());

        List<LearningRecordViewDto> records = recordEntities.stream()
                .map(record -> toLearningRecordViewDto(record, userNameMap))
                .collect(Collectors.toList());

        List<RecentActivityDto> recentActivities = buildRecentActivities(recordEntities, userNameMap, caseTitleMap);

        return DashboardDataDto.builder()
                .stats(getSiteStats())
                .recentActivities(recentActivities)
                .users(users)
                .modules(modules)
                .cases(cases)
                .records(records)
                .build();
    }

    private List<User> getAllUsers() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(User::getId);
        return userMapper.selectList(wrapper);
    }

    private List<Module> getAllModules() {
        LambdaQueryWrapper<Module> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Module::getSortOrder)
                .orderByAsc(Module::getId);
        return moduleMapper.selectList(wrapper);
    }

    private List<LearningRecord> getAllRecords() {
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(LearningRecord::getCreateTime)
                .orderByDesc(LearningRecord::getUpdateTime)
                .orderByDesc(LearningRecord::getId);
        return learningRecordMapper.selectList(wrapper);
    }

    private long countEnabledCases() {
        LambdaQueryWrapper<ProgramCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgramCase::getStatus, 1);
        return programCaseMapper.selectCount(wrapper);
    }

    private long countEnabledModules() {
        LambdaQueryWrapper<Module> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Module::getStatus, 1);
        return moduleMapper.selectCount(wrapper);
    }

    private long countCompletedUsers() {
        LambdaQueryWrapper<Progress> wrapper = new LambdaQueryWrapper<>();
        wrapper.gt(Progress::getTotalCases, 0);
        return progressMapper.selectCount(wrapper);
    }

    private long sumAllStars() {
        List<LearningRecord> records = learningRecordMapper.selectList(null);
        return records.stream()
                .mapToLong(item -> Math.max(0, item.getStars() == null ? 0 : item.getStars()))
                .sum();
    }

    private AdminUserDto toAdminUserDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .points(user.getPoints())
                .level(user.getLevel())
                .status(user.getStatus())
                .build();
    }

    private LearningRecordViewDto toLearningRecordViewDto(LearningRecord record, Map<Integer, String> userNameMap) {
        return LearningRecordViewDto.builder()
                .id(record.getId())
                .userId(record.getUserId())
                .userName(userNameMap.getOrDefault(record.getUserId(), "未知用户"))
                .caseId(record.getCaseId())
                .workName(record.getWorkName())
                .duration(record.getDuration())
                .stars(record.getStars())
                .createTime(formatDateTime(record.getCreateTime()))
                .build();
    }

    private List<RecentActivityDto> buildRecentActivities(
            List<LearningRecord> records,
            Map<Integer, String> userNameMap,
            Map<Integer, String> caseTitleMap
    ) {
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        return records.stream()
                .limit(8)
                .map(record -> RecentActivityDto.builder()
                        .time(formatDateTime(resolveActivityTime(record)))
                        .user(userNameMap.getOrDefault(record.getUserId(), "未知用户"))
                        .action(buildActivityAction(record, caseTitleMap))
                        .build())
                .collect(Collectors.toList());
    }

    private LocalDateTime resolveActivityTime(LearningRecord record) {
        if (record.getUpdateTime() != null) {
            return record.getUpdateTime();
        }
        return record.getCreateTime();
    }

    private String buildActivityAction(LearningRecord record, Map<Integer, String> caseTitleMap) {
        if (StringUtils.isNotBlank(record.getWorkName())
                && !record.getWorkName().matches("^关卡\\s*\\d+\\s*通关作品$")) {
            return "保存了作品：" + record.getWorkName();
        }

        if (record.getCaseId() != null) {
            String caseTitle = caseTitleMap.get(record.getCaseId());
            if (StringUtils.isNotBlank(caseTitle)) {
                return "完成了关卡：" + caseTitle;
            }
            return "完成了第 " + record.getCaseId() + " 关";
        }

        if (StringUtils.isNotBlank(record.getWorkName())) {
            return "保存了作品：" + record.getWorkName();
        }

        return "新增了一条学习记录";
    }

    private String formatDateTime(LocalDateTime time) {
        if (time == null) {
            return "-";
        }
        return DATE_TIME_FORMATTER.format(time);
    }
}
