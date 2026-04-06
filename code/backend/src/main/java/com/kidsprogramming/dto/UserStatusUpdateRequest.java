package com.kidsprogramming.dto;

import lombok.Data;

/**
 * 用户状态更新请求
 */
@Data
public class UserStatusUpdateRequest {

    /**
     * 状态：1-正常，0-冻结
     */
    private Integer status;
}
