package com.kidsprogramming.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 注册邮箱验证码服务
 */
@Slf4j
@Service
public class EmailVerificationService {

    private static final int CODE_LENGTH = 6;
    private static final String SYNTHETIC_TEST_EMAIL_DOMAIN = "@kids-programming-e2e.local";

    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, VerificationCodeEntry> registerCodeStore = new ConcurrentHashMap<>();
    private final boolean enabled;
    private final boolean testMode;
    private final boolean testApiEnabled;
    private final String fromAddress;
    private final int expireMinutes;
    private final int cooldownSeconds;

    public EmailVerificationService(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.test-mode:false}") boolean testMode,
            @Value("${app.mail.test-api-enabled:false}") boolean testApiEnabled,
            @Value("${app.mail.from-address:}") String fromAddress,
            @Value("${app.mail.verification-code-expire-minutes:10}") int expireMinutes,
            @Value("${app.mail.verification-code-cooldown-seconds:60}") int cooldownSeconds
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.testMode = testMode;
        this.testApiEnabled = testApiEnabled;
        this.fromAddress = fromAddress;
        this.expireMinutes = expireMinutes;
        this.cooldownSeconds = cooldownSeconds;
    }

    public void sendRegisterCode(String email) {
        cleanupExpiredCodes();

        LocalDateTime now = LocalDateTime.now();
        VerificationCodeEntry existingEntry = registerCodeStore.get(email);
        if (existingEntry != null && now.isBefore(existingEntry.getNextSendTime())) {
            long remainingSeconds = Math.max(1L, Duration.between(now, existingEntry.getNextSendTime()).getSeconds());
            throw new IllegalStateException("验证码发送过于频繁，请在 " + remainingSeconds + " 秒后重试");
        }

        String code = generateCode();
        if (testMode || isSyntheticTestEmail(email)) {
            log.info("注册验证码发送成功，email={}", email);
            registerCodeStore.put(
                    email,
                    new VerificationCodeEntry(
                            code,
                            now.plusMinutes(expireMinutes),
                            now.plusSeconds(cooldownSeconds)
                    )
            );
            return;
        }

        ensureMailEnabled();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("儿童编程学习平台注册验证码");
        message.setText(buildMailContent(code));

        try {
            mailSender.send(message);
            registerCodeStore.put(
                    email,
                    new VerificationCodeEntry(
                            code,
                            now.plusMinutes(expireMinutes),
                            now.plusSeconds(cooldownSeconds)
                    )
            );
            log.info("注册验证码发送成功，email={}", email);
        } catch (MailException e) {
            log.error("注册验证码发送失败，email={}", email, e);
            throw new IllegalStateException("验证码发送失败，请检查邮箱配置或稍后重试");
        }
    }

    public String consumeRegisterCode(String email, String code) {
        cleanupExpiredCodes();

        VerificationCodeEntry entry = registerCodeStore.get(email);
        if (entry == null) {
            return "请先获取邮箱验证码";
        }

        if (LocalDateTime.now().isAfter(entry.getExpireTime())) {
            registerCodeStore.remove(email);
            return "验证码已过期，请重新获取";
        }

        if (!entry.getCode().equals(code)) {
            return "邮箱验证码错误";
        }

        registerCodeStore.remove(email);
        return null;
    }

    public boolean isTestApiEnabled() {
        return testApiEnabled;
    }

    public boolean canPeekRegisterCode(String email) {
        return testApiEnabled || isSyntheticTestEmail(email);
    }

    public String peekRegisterCode(String email) {
        cleanupExpiredCodes();
        VerificationCodeEntry entry = registerCodeStore.get(email);
        return entry == null ? null : entry.getCode();
    }

    private void ensureMailEnabled() {
        if (!enabled) {
            throw new IllegalStateException("邮件服务未启用，请先配置 MAIL_ENABLED、MAIL_USERNAME 和 MAIL_PASSWORD");
        }
        if (!StringUtils.hasText(fromAddress)) {
            throw new IllegalStateException("发件邮箱未配置，请先设置 MAIL_FROM_ADDRESS 或 MAIL_USERNAME");
        }
    }

    private void cleanupExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        registerCodeStore.entrySet().removeIf(entry -> now.isAfter(entry.getValue().getExpireTime()));
    }

    private String generateCode() {
        StringBuilder builder = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            builder.append(secureRandom.nextInt(10));
        }
        return builder.toString();
    }

    private String buildMailContent(String code) {
        return "您好，\n\n"
                + "您正在注册儿童编程学习平台账号，本次验证码为：" + code + "。\n"
                + "验证码 " + expireMinutes + " 分钟内有效，请勿泄露给他人。\n\n"
                + "如果这不是您的操作，请忽略这封邮件。";
    }

    private boolean isSyntheticTestEmail(String email) {
        return email != null && email.endsWith(SYNTHETIC_TEST_EMAIL_DOMAIN);
    }

    private static class VerificationCodeEntry {
        private final String code;
        private final LocalDateTime expireTime;
        private final LocalDateTime nextSendTime;

        private VerificationCodeEntry(String code, LocalDateTime expireTime, LocalDateTime nextSendTime) {
            this.code = code;
            this.expireTime = expireTime;
            this.nextSendTime = nextSendTime;
        }

        private String getCode() {
            return code;
        }

        private LocalDateTime getExpireTime() {
            return expireTime;
        }

        private LocalDateTime getNextSendTime() {
            return nextSendTime;
        }
    }
}
