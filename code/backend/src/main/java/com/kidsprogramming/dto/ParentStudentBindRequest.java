package com.kidsprogramming.dto;

import lombok.Data;

/**
 * 家长绑定学生请求
 */
@Data
public class ParentStudentBindRequest {

    private Integer parentId;

    private String studentUsername;

    private String studentPassword;
}
