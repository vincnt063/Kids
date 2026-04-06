package com.kidsprogramming.dto;

import lombok.Data;

/**
 * 模块更新请求
 */
@Data
public class ModuleUpdateRequest {

    /**
     * 模块颜色，十六进制格式
     */
    private String color;

    /**
     * 状态：1-启用，0-禁用
     */
    private Integer status;
}
