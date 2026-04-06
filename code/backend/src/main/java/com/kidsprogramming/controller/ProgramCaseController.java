package com.kidsprogramming.controller;

import com.kidsprogramming.dto.ProgramCaseViewDto;
import com.kidsprogramming.dto.ProgramCaseUpdateRequest;
import com.kidsprogramming.dto.Result;
import com.kidsprogramming.entity.ProgramCase;
import com.kidsprogramming.service.ProgramCaseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 编程案例控制器
 */
@Slf4j
@RestController
@RequestMapping("/case")
public class ProgramCaseController {

    @Autowired
    private ProgramCaseService programCaseService;

    /**
     * 获取所有案例
     */
    @GetMapping("/list")
    public Result<List<ProgramCaseViewDto>> getAllCases() {
        try {
            List<ProgramCaseViewDto> cases = programCaseService.getEnabledCases();
            return Result.success(cases);
        } catch (Exception e) {
            log.error("获取案例列表失败", e);
            return Result.error("获取案例列表失败：" + e.getMessage());
        }
    }

    /**
     * 根据难度获取案例
     */
    @GetMapping("/difficulty/{difficulty}")
    public Result<List<ProgramCaseViewDto>> getCasesByDifficulty(@PathVariable String difficulty) {
        try {
            List<ProgramCaseViewDto> cases = programCaseService.getCasesByDifficulty(difficulty);
            return Result.success(cases);
        } catch (Exception e) {
            log.error("获取案例失败", e);
            return Result.error("获取案例失败：" + e.getMessage());
        }
    }

    /**
     * 获取案例详情
     */
    @GetMapping("/{id}")
    public Result<ProgramCaseViewDto> getCaseDetail(@PathVariable Integer id) {
        try {
            ProgramCaseViewDto caseInfo = programCaseService.getCaseById(id);
            if (caseInfo == null) {
                return Result.error(404, "案例不存在");
            }
            return Result.success(caseInfo);
        } catch (Exception e) {
            log.error("获取案例详情失败", e);
            return Result.error("获取案例详情失败：" + e.getMessage());
        }
    }

    /**
     * 更新案例初始角色和状态
     */
    @PutMapping("/{id}")
    public Result<ProgramCaseViewDto> updateCase(@PathVariable Integer id, @RequestBody ProgramCaseUpdateRequest request) {
        try {
            if (id == null) {
                return Result.error(400, "案例 ID 不能为空");
            }

            if (request == null) {
                return Result.error(400, "更新内容不能为空");
            }

            String character = normalizeCharacter(request.getCharacter());
            Integer status = request.getStatus();

            if (character == null || character.isEmpty()) {
                return Result.error(400, "初始角色不能为空");
            }

            if (status == null || (status != 0 && status != 1)) {
                return Result.error(400, "案例状态只能是上架或在库中");
            }

            ProgramCase caseInfo = programCaseService.getById(id);
            if (caseInfo == null) {
                return Result.error(404, "案例不存在");
            }

            caseInfo.setCharacter(character);
            caseInfo.setStatus(status);
            programCaseService.updateById(caseInfo);

            return Result.success(programCaseService.getCaseById(id));
        } catch (Exception e) {
            log.error("更新案例失败，caseId={}", id, e);
            return Result.error("更新案例失败：" + e.getMessage());
        }
    }

    private String normalizeCharacter(String character) {
        return character == null ? null : character.trim().toLowerCase();
    }
}
