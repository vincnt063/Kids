package com.kidsprogramming.dto;

import lombok.Data;

/**
 * 发送邮箱验证码请求
 */
@Data
public class EmailCodeRequest {

    /**
     * 邮箱
     */
    private String email;
}
