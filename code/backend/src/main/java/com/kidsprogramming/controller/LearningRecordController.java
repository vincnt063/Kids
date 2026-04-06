package com.kidsprogramming.controller;

import com.kidsprogramming.dto.Result;
import com.kidsprogramming.entity.LearningRecord;
import com.kidsprogramming.service.LearningRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 学习记录控制器
 */
@Slf4j
@RestController
@RequestMapping("/record")
public class LearningRecordController {

    @Autowired
    private LearningRecordService learningRecordService;

    /**
     * 获取用户的学习记录
     */
    @GetMapping("/user/{userId}")
    public Result<List<LearningRecord>> getUserRecords(@PathVariable Integer userId) {
        try {
            List<LearningRecord> records = learningRecordService.getUserRecords(userId);
            return Result.success(records);
        } catch (Exception e) {
            log.error("获取学习记录失败", e);
            return Result.error("获取学习记录失败：" + e.getMessage());
        }
    }

    /**
     * 保存学习记录
     */
    @PostMapping("/save")
    public Result<Map<String, Object>> saveRecord(@RequestBody LearningRecord record) {
        try {
            boolean success = learningRecordService.saveRecord(record);
            
            Map<String, Object> data = new HashMap<>();
            data.put("id", record.getId());
            data.put("success", success);
            
            return Result.success(data);
        } catch (Exception e) {
            log.error("保存学习记录失败", e);
            return Result.error("保存学习记录失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户作品数量
     */
    @GetMapping("/works/count/{userId}")
    public Result<Map<String, Integer>> getWorksCount(@PathVariable Integer userId) {
        try {
            int count = learningRecordService.getUserWorksCount(userId);
            
            Map<String, Integer> data = new HashMap<>();
            data.put("count", count);
            
            return Result.success(data);
        } catch (Exception e) {
            log.error("获取作品数量失败", e);
            return Result.error("获取作品数量失败：" + e.getMessage());
        }
    }
}
