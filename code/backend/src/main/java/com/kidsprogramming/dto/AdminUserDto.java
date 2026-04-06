package com.kidsprogramming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 后台用户列表项
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {

    private Integer id;

    private String username;

    private String role;

    private Integer points;

    private Integer level;

    private Integer status;
}
