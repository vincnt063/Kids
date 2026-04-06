package com.kidsprogramming.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.kidsprogramming.dto.EmailCodeRequest;
import com.kidsprogramming.dto.LearningRecordSummaryDto;
import com.kidsprogramming.dto.LoginRequest;
import com.kidsprogramming.dto.ParentStudentBindRequest;
import com.kidsprogramming.dto.ParentStudentOverviewDto;
import com.kidsprogramming.dto.RegisterRequest;
import com.kidsprogramming.dto.Result;
import com.kidsprogramming.dto.UserStatusUpdateRequest;
import com.kidsprogramming.entity.LearningRecord;
import com.kidsprogramming.entity.ParentStudentBinding;
import com.kidsprogramming.entity.Progress;
import com.kidsprogramming.entity.User;
import com.kidsprogramming.mapper.ParentStudentBindingMapper;
import com.kidsprogramming.mapper.UserMapper;
import com.kidsprogramming.service.EmailVerificationService;
import com.kidsprogramming.service.LearningRecordService;
import com.kidsprogramming.service.ProgressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 用户控制器
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    private static final int MAX_PARENT_BINDINGS = 3;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ParentStudentBindingMapper parentStudentBindingMapper;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private LearningRecordService learningRecordService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    /**
     * 发送注册邮箱验证码
     */
    @PostMapping("/register/email-code")
    public Result<Void> sendRegisterEmailCode(@RequestBody EmailCodeRequest request) {
        try {
            String email = normalizeEmail(request == null ? null : request.getEmail());
            if (email == null || email.isEmpty()) {
                return Result.error(400, "邮箱不能为空");
            }
            if (!isValidEmail(email)) {
                return Result.error(400, "请输入正确的邮箱地址");
            }

            User existingUser = userMapper.findByEmail(email);
            if (existingUser != null) {
                return Result.error(400, "该邮箱已绑定其他账号");
            }

            emailVerificationService.sendRegisterCode(email);
            return Result.success();
        } catch (IllegalStateException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("发送注册邮箱验证码失败", e);
            return Result.error("发送注册邮箱验证码失败：" + e.getMessage());
        }
    }

    /**
     * 测试环境读取注册邮箱验证码
     */
    @GetMapping("/test-support/register-code")
    public Result<Map<String, String>> getRegisterCodeForTest(@RequestParam String email) {
        try {
            String normalizedEmail = normalizeEmail(email);
            if (normalizedEmail == null || normalizedEmail.isEmpty()) {
                return Result.error(400, "邮箱不能为空");
            }

            if (!emailVerificationService.canPeekRegisterCode(normalizedEmail)) {
                return Result.error(403, "测试接口未启用");
            }

            String code = emailVerificationService.peekRegisterCode(normalizedEmail);
            if (code == null) {
                return Result.error(404, "未找到验证码");
            }

            Map<String, String> data = new HashMap<>();
            data.put("email", normalizedEmail);
            data.put("code", code);
            return Result.success(data);
        } catch (Exception e) {
            log.error("读取测试验证码失败", e);
            return Result.error("读取测试验证码失败：" + e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        try {
            String username = normalizeCredential(request == null ? null : request.getUsername());
            String password = normalizeCredential(request == null ? null : request.getPassword());
            String role = normalizeCredential(request == null ? null : request.getRole());
            String email = normalizeEmail(request == null ? null : request.getEmail());
            String emailCode = normalizeCredential(request == null ? null : request.getEmailCode());

            if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                return Result.error(400, "用户名和密码不能为空");
            }
            if (email == null || email.isEmpty() || emailCode == null || emailCode.isEmpty()) {
                return Result.error(400, "邮箱和验证码不能为空");
            }
            if (!isValidEmail(email)) {
                return Result.error(400, "请输入正确的邮箱地址");
            }

            if (role == null || role.isEmpty()) {
                role = "child";
            }
            if (!isRegisterRoleSupported(role)) {
                return Result.error(400, "注册仅支持学生或家长账号");
            }

            User existUser = userMapper.findByUsername(username);
            if (existUser != null) {
                return Result.error(400, "用户名已存在");
            }

            User existEmailUser = userMapper.findByEmail(email);
            if (existEmailUser != null) {
                return Result.error(400, "该邮箱已绑定其他账号");
            }

            String emailCodeError = emailVerificationService.consumeRegisterCode(email, emailCode);
            if (emailCodeError != null) {
                return Result.error(400, emailCodeError);
            }

            User user = new User();
            user.setUsername(username);
            user.setPassword(password); // TODO: 实际项目中需要加密
            user.setRole(role);
            user.setPoints(0);
            user.setLevel(1);
            user.setStatus(1);
            user.setEmail(email);
            userMapper.insert(user);

            Map<String, Object> data = new HashMap<>();
            data.put("userId", user.getId());
            data.put("username", user.getUsername());
            data.put("email", user.getEmail());
            return Result.success(data);
        } catch (Exception e) {
            log.error("注册失败", e);
            return Result.error("注册失败：" + e.getMessage());
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            String username = normalizeCredential(request.getUsername());
            String password = normalizeCredential(request.getPassword());

            if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                return Result.error(400, "用户名和密码不能为空");
            }

            User user = userMapper.findByUsername(username);
            if (user == null) {
                log.warn("登录失败：未找到用户，username='{}'", username);
                return Result.error(401, "用户名或密码错误");
            }

            if (Integer.valueOf(0).equals(user.getStatus())) {
                return Result.error(401, "账户已被冻结，请联系管理员");
            }

            String storedPassword = normalizeCredential(user.getPassword());
            if (!password.equals(storedPassword)) {
                log.warn(
                        "登录失败：密码不匹配，username='{}'，输入长度={}，库存长度={}",
                        username,
                        password.length(),
                        storedPassword == null ? 0 : storedPassword.length()
                );
                return Result.error(401, "用户名或密码错误");
            }

            String token = "mock_token_" + username + "_" + System.currentTimeMillis();

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user", buildUserInfo(user));
            return Result.success(data);
        } catch (Exception e) {
            log.error("登录失败", e);
            return Result.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo(@RequestParam Integer userId) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error(404, "用户不存在");
            }
            return Result.success(buildUserInfo(user));
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return Result.error("获取用户信息失败：" + e.getMessage());
        }
    }

    /**
     * 家长绑定学生账号
     */
    @PostMapping("/parent/bind")
    public Result<ParentStudentOverviewDto> bindStudent(@RequestBody ParentStudentBindRequest request) {
        try {
            Integer parentId = request == null ? null : request.getParentId();
            String studentUsername = normalizeCredential(request == null ? null : request.getStudentUsername());
            String studentPassword = normalizeCredential(request == null ? null : request.getStudentPassword());

            if (parentId == null) {
                return Result.error(400, "家长账号不能为空");
            }
            if (studentUsername == null || studentUsername.isEmpty() || studentPassword == null || studentPassword.isEmpty()) {
                return Result.error(400, "请输入学生账号和密码");
            }

            User parent = requireParentUser(parentId);
            if (parent == null) {
                return Result.error(404, "家长账号不存在");
            }

            User student = userMapper.findByUsername(studentUsername);
            if (student == null || !"child".equals(student.getRole())) {
                return Result.error(404, "未找到可绑定的学生账号");
            }

            String storedPassword = normalizeCredential(student.getPassword());
            if (!studentPassword.equals(storedPassword)) {
                return Result.error(401, "学生账号或密码错误");
            }

            LambdaQueryWrapper<ParentStudentBinding> duplicateWrapper = new LambdaQueryWrapper<>();
            duplicateWrapper.eq(ParentStudentBinding::getParentId, parentId)
                    .eq(ParentStudentBinding::getStudentId, student.getId())
                    .last("LIMIT 1");
            ParentStudentBinding existingBinding = parentStudentBindingMapper.selectOne(duplicateWrapper);
            if (existingBinding != null) {
                return Result.error(400, "该学生账号已绑定到当前家长账户");
            }

            LambdaQueryWrapper<ParentStudentBinding> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(ParentStudentBinding::getParentId, parentId);
            Long bindingCount = parentStudentBindingMapper.selectCount(countWrapper);
            if (bindingCount != null && bindingCount >= MAX_PARENT_BINDINGS) {
                return Result.error(400, "每个家长账号最多只能绑定 3 个学生账号");
            }

            ParentStudentBinding binding = new ParentStudentBinding();
            binding.setParentId(parent.getId());
            binding.setStudentId(student.getId());
            parentStudentBindingMapper.insert(binding);

            return Result.success(buildParentStudentOverview(binding, student));
        } catch (Exception e) {
            log.error("家长绑定学生失败", e);
            return Result.error("家长绑定学生失败：" + e.getMessage());
        }
    }

    /**
     * 获取家长已绑定学生列表
     */
    @GetMapping("/parent/{parentId}/children")
    public Result<List<ParentStudentOverviewDto>> getBoundStudents(@PathVariable Integer parentId) {
        try {
            User parent = requireParentUser(parentId);
            if (parent == null) {
                return Result.error(404, "家长账号不存在");
            }

            LambdaQueryWrapper<ParentStudentBinding> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(ParentStudentBinding::getParentId, parentId)
                    .orderByAsc(ParentStudentBinding::getId);

            List<ParentStudentBinding> bindings = parentStudentBindingMapper.selectList(wrapper);
            List<ParentStudentOverviewDto> items = new ArrayList<>();

            for (ParentStudentBinding binding : bindings) {
                User student = userMapper.selectById(binding.getStudentId());
                if (student == null || !"child".equals(student.getRole())) {
                    continue;
                }

                items.add(buildParentStudentOverview(binding, student));
            }

            return Result.success(items);
        } catch (Exception e) {
            log.error("获取家长绑定学生列表失败，parentId={}", parentId, e);
            return Result.error("获取家长绑定学生列表失败：" + e.getMessage());
        }
    }

    /**
     * 家长更新学生账号状态
     */
    @PutMapping("/parent/{parentId}/children/{studentId}/status")
    public Result<ParentStudentOverviewDto> updateBoundStudentStatus(
            @PathVariable Integer parentId,
            @PathVariable Integer studentId,
            @RequestBody UserStatusUpdateRequest request
    ) {
        try {
            User parent = requireParentUser(parentId);
            if (parent == null) {
                return Result.error(404, "家长账号不存在");
            }

            Integer status = request == null ? null : request.getStatus();
            if (status == null || (status != 0 && status != 1)) {
                return Result.error(400, "学生账号状态只能是启用或冻结");
            }

            LambdaQueryWrapper<ParentStudentBinding> bindingWrapper = new LambdaQueryWrapper<>();
            bindingWrapper.eq(ParentStudentBinding::getParentId, parentId)
                    .eq(ParentStudentBinding::getStudentId, studentId)
                    .last("LIMIT 1");
            ParentStudentBinding binding = parentStudentBindingMapper.selectOne(bindingWrapper);
            if (binding == null) {
                return Result.error(403, "只能操作已绑定的学生账号");
            }

            User student = userMapper.selectById(studentId);
            if (student == null || !"child".equals(student.getRole())) {
                return Result.error(404, "学生账号不存在");
            }

            student.setStatus(status);
            userMapper.updateById(student);

            return Result.success(buildParentStudentOverview(binding, student));
        } catch (Exception e) {
            log.error("家长更新学生账号状态失败，parentId={}，studentId={}", parentId, studentId, e);
            return Result.error("家长更新学生账号状态失败：" + e.getMessage());
        }
    }

    /**
     * 更新用户状态
     */
    @PutMapping("/{id}/status")
    public Result<Map<String, Object>> updateUserStatus(
            @PathVariable Integer id,
            @RequestBody UserStatusUpdateRequest request
    ) {
        try {
            if (id == null) {
                return Result.error(400, "用户 ID 不能为空");
            }

            Integer status = request == null ? null : request.getStatus();
            if (status == null || (status != 0 && status != 1)) {
                return Result.error(400, "用户状态只能是正常或冻结");
            }

            User user = userMapper.selectById(id);
            if (user == null) {
                return Result.error(404, "用户不存在");
            }

            user.setStatus(status);
            userMapper.updateById(user);

            return Result.success(buildUserInfo(user));
        } catch (Exception e) {
            log.error("更新用户状态失败，userId={}", id, e);
            return Result.error("更新用户状态失败：" + e.getMessage());
        }
    }

    /**
     * 构建用户信息对象
     */
    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("role", user.getRole());
        info.put("avatar", user.getAvatar());
        info.put("points", user.getPoints());
        info.put("level", user.getLevel());
        info.put("status", user.getStatus());
        info.put("email", user.getEmail());
        return info;
    }

    private ParentStudentOverviewDto buildParentStudentOverview(ParentStudentBinding binding, User student) {
        Progress progress = progressService.getUserProgress(student.getId());
        if (progress == null) {
            progress = new Progress();
            progress.setUserId(student.getId());
            progress.setTotalCases(0);
            progress.setTotalTime(0);
            progress.setTotalWorks(0);
            progress.setCurrentLevel(1);
            progress.setTotalPoints(0);
        }

        LambdaQueryWrapper<LearningRecord> recordWrapper = new LambdaQueryWrapper<>();
        recordWrapper.eq(LearningRecord::getUserId, student.getId())
                .orderByDesc(LearningRecord::getUpdateTime)
                .orderByDesc(LearningRecord::getCreateTime)
                .last("LIMIT 5");

        List<LearningRecordSummaryDto> records = learningRecordService.list(recordWrapper)
                .stream()
                .map(this::toLearningRecordSummary)
                .toList();

        return ParentStudentOverviewDto.builder()
                .bindingId(binding.getId())
                .studentId(student.getId())
                .studentUsername(student.getUsername())
                .status(student.getStatus())
                .progress(progress)
                .caseProgress(progressService.getUserCaseProgress(student.getId()))
                .records(records)
                .build();
    }

    private LearningRecordSummaryDto toLearningRecordSummary(LearningRecord record) {
        return LearningRecordSummaryDto.builder()
                .id(record.getId())
                .caseId(record.getCaseId())
                .workName(record.getWorkName())
                .result(record.getResult())
                .duration(record.getDuration())
                .stars(record.getStars())
                .createTime(formatDateTime(record.getCreateTime()))
                .updateTime(formatDateTime(record.getUpdateTime()))
                .build();
    }

    private User requireParentUser(Integer userId) {
        User user = userMapper.selectById(userId);
        if (user == null || !"parent".equals(user.getRole())) {
            return null;
        }
        return user;
    }

    private boolean isRegisterRoleSupported(String role) {
        return "child".equals(role) || "parent".equals(role);
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? null : DATE_TIME_FORMATTER.format(value);
    }

    private String normalizeCredential(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeCredential(value);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
}
