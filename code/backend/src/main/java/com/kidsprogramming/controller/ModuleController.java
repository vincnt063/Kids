package com.kidsprogramming.controller;

import com.kidsprogramming.dto.ModuleUpdateRequest;
import com.kidsprogramming.dto.Result;
import com.kidsprogramming.entity.Module;
import com.kidsprogramming.service.ModuleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 编程模块控制器
 */
@Slf4j
@RestController
@RequestMapping("/module")
public class ModuleController {

    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#[0-9A-Fa-f]{6}$");

    @Autowired
    private ModuleService moduleService;

    /**
     * 获取所有模块
     */
    @GetMapping("/list")
    public Result<List<Module>> getAllModules() {
        try {
            List<Module> modules = moduleService.getEnabledModules();
            return Result.success(modules);
        } catch (Exception e) {
            log.error("获取模块列表失败", e);
            return Result.error("获取模块列表失败：" + e.getMessage());
        }
    }

    /**
     * 根据类型获取模块
     */
    @GetMapping("/type/{type}")
    public Result<List<Module>> getModulesByType(@PathVariable String type) {
        try {
            List<Module> modules = moduleService.getModulesByType(type);
            return Result.success(modules);
        } catch (Exception e) {
            log.error("获取模块失败", e);
            return Result.error("获取模块失败：" + e.getMessage());
        }
    }

    /**
     * 获取模块分类
     */
    @GetMapping("/categories")
    public Result<Map<String, List<Module>>> getModuleCategories() {
        try {
            Map<String, List<Module>> categories = new HashMap<>();
            
            // 按类型分组获取模块
            String[] types = {"event", "motion", "control", "looks", "operator"};
            for (String type : types) {
                categories.put(type, moduleService.getModulesByType(type));
            }
            
            return Result.success(categories);
        } catch (Exception e) {
            log.error("获取模块分类失败", e);
            return Result.error("获取模块分类失败：" + e.getMessage());
        }
    }

    /**
     * 更新模块颜色和状态
     */
    @PutMapping("/{id}")
    public Result<Module> updateModule(@PathVariable Integer id, @RequestBody ModuleUpdateRequest request) {
        try {
            if (id == null) {
                return Result.error(400, "模块 ID 不能为空");
            }

            if (request == null) {
                return Result.error(400, "更新内容不能为空");
            }

            String color = normalizeColor(request.getColor());
            Integer status = request.getStatus();

            if (color == null || color.isEmpty()) {
                return Result.error(400, "模块颜色不能为空");
            }

            if (!HEX_COLOR_PATTERN.matcher(color).matches()) {
                return Result.error(400, "模块颜色格式不正确，请使用 6 位十六进制颜色值");
            }

            if (status == null || (status != 0 && status != 1)) {
                return Result.error(400, "模块状态只能是启用或禁用");
            }

            Module module = moduleService.getById(id);
            if (module == null) {
                return Result.error(404, "模块不存在");
            }

            module.setColor(color);
            module.setStatus(status);
            moduleService.updateById(module);

            return Result.success(module);
        } catch (Exception e) {
            log.error("更新模块失败，moduleId={}", id, e);
            return Result.error("更新模块失败：" + e.getMessage());
        }
    }

    private String normalizeColor(String color) {
        return color == null ? null : color.trim().toUpperCase();
    }
}
