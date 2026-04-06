package com.kidsprogramming.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.kidsprogramming.entity.Module;

import java.util.List;

/**
 * 编程模块服务接口
 */
public interface ModuleService extends IService<Module> {

    /**
     * 获取所有启用的模块
     * @return 模块列表
     */
    List<Module> getEnabledModules();

    /**
     * 根据类型获取模块
     * @param type 模块类型
     * @return 模块列表
     */
    List<Module> getModulesByType(String type);
}
