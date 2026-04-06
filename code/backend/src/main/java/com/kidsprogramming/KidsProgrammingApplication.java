package com.kidsprogramming;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

/**
 * 儿童编程学习网站后端启动类
 */
@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
@MapperScan("com.kidsprogramming.mapper")
public class KidsProgrammingApplication {

    public static void main(String[] args) {
        SpringApplication.run(KidsProgrammingApplication.class, args);
        System.out.println("========================================");
        System.out.println("儿童编程学习网站后端服务启动成功！");
        System.out.println("访问地址：http://localhost:8080/api");
        System.out.println("========================================");
    }
}
