package com.kidsprogramming.dto;

import lombok.Data;

/**
 * 案例更新请求
 */
@Data
public class ProgramCaseUpdateRequest {

    /**
     * 初始角色代码
     */
    private String character;

    /**
     * 状态：1-上架，0-在库中
     */
    private Integer status;
}
