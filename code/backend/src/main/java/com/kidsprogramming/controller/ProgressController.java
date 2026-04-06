package com.kidsprogramming.controller;

import com.kidsprogramming.dto.CaseProgressDto;
import com.kidsprogramming.dto.Result;
import com.kidsprogramming.entity.Progress;
import com.kidsprogramming.service.ProgressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 学习进度控制器
 */
@Slf4j
@RestController
@RequestMapping("/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    /**
     * 获取用户的学习进度
     */
    @GetMapping("/user/{userId}")
    public Result<Progress> getUserProgress(@PathVariable Integer userId) {
        try {
            Progress progress = progressService.getUserProgress(userId);
            if (progress == null) {
                progress = new Progress();
                progress.setUserId(userId);
                progress.setTotalCases(0);
                progress.setTotalTime(0);
                progress.setTotalWorks(0);
                progress.setCurrentLevel(1);
                progress.setTotalPoints(0);
            }
            return Result.success(progress);
        } catch (Exception e) {
            log.error("获取学习进度失败", e);
            return Result.error("获取学习进度失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户的单关进度
     */
    @GetMapping("/user/{userId}/cases")
    public Result<List<CaseProgressDto>> getUserCaseProgress(@PathVariable Integer userId) {
        try {
            return Result.success(progressService.getUserCaseProgress(userId));
        } catch (Exception e) {
            log.error("获取单关进度失败", e);
            return Result.error("获取单关进度失败：" + e.getMessage());
        }
    }

    /**
     * 更新学习进度
     */
    @PostMapping("/update")
    public Result<Map<String, Object>> updateProgress(@RequestBody Map<String, Integer> params) {
        try {
            Integer userId = params.get("userId");
            Integer caseId = params.get("caseId");
            Integer stars = params.get("stars");
            
            progressService.updateProgress(userId, caseId, stars);
            
            Map<String, Object> data = new HashMap<>();
            data.put("success", true);
            data.put("message", "进度更新成功");
            
            return Result.success(data);
        } catch (Exception e) {
            log.error("更新学习进度失败", e);
            return Result.error("更新学习进度失败：" + e.getMessage());
        }
    }
}
