package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.kidsprogramming.entity.Module;
import com.kidsprogramming.mapper.ModuleMapper;
import com.kidsprogramming.service.ModuleService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 编程模块服务实现类
 */
@Service
public class ModuleServiceImpl extends ServiceImpl<ModuleMapper, Module> implements ModuleService {

    @Override
    public List<Module> getEnabledModules() {
        LambdaQueryWrapper<Module> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Module::getStatus, 1)
               .orderByAsc(Module::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    public List<Module> getModulesByType(String type) {
        LambdaQueryWrapper<Module> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Module::getType, type)
               .eq(Module::getStatus, 1)
               .orderByAsc(Module::getSortOrder);
        return this.list(wrapper);
    }
}
