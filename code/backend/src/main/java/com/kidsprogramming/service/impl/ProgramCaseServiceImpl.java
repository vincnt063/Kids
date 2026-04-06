package com.kidsprogramming.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.kidsprogramming.dto.ProgramCaseConfigPayload;
import com.kidsprogramming.dto.ProgramCaseViewDto;
import com.kidsprogramming.entity.ProgramCase;
import com.kidsprogramming.mapper.ProgramCaseMapper;
import com.kidsprogramming.service.ProgramCaseService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 编程案例服务实现类
 */
@Slf4j
@Service
public class ProgramCaseServiceImpl extends ServiceImpl<ProgramCaseMapper, ProgramCase> implements ProgramCaseService {

    private static final List<String> DEFAULT_AVAILABLE_BLOCKS = Collections.unmodifiableList(Arrays.asList(
            "move_up",
            "move_down",
            "move_left",
            "move_right",
            "turn_left",
            "turn_right",
            "goto_xy",
            "repeat",
            "repeat_until",
            "if_else",
            "switch_signal",
            "path_clear",
            "touching_obstacle",
            "wait_seconds",
            "say"
    ));

    private final ObjectMapper objectMapper;

    public ProgramCaseServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<ProgramCaseViewDto> getEnabledCases() {
        LambdaQueryWrapper<ProgramCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgramCase::getStatus, 1)
               .orderByAsc(ProgramCase::getSortOrder);
        return this.list(wrapper).stream()
                .map(this::toViewDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgramCaseViewDto> getCasesByDifficulty(String difficulty) {
        LambdaQueryWrapper<ProgramCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgramCase::getDifficulty, difficulty)
               .eq(ProgramCase::getStatus, 1)
               .orderByAsc(ProgramCase::getSortOrder);
        return this.list(wrapper).stream()
                .map(this::toViewDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgramCaseViewDto> getAllCases() {
        LambdaQueryWrapper<ProgramCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(ProgramCase::getSortOrder)
                .orderByAsc(ProgramCase::getId);
        return this.list(wrapper).stream()
                .map(this::toViewDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramCaseViewDto getCaseById(Integer id) {
        ProgramCase caseEntity = this.getById(id);
        return caseEntity == null ? null : toViewDto(caseEntity);
    }

    private ProgramCaseViewDto toViewDto(ProgramCase caseEntity) {
        ProgramCaseConfigPayload config = parseCaseConfig(caseEntity.getCaseConfig());
        String title = StringUtils.defaultString(caseEntity.getTitle());
        String difficulty = StringUtils.defaultIfBlank(caseEntity.getDifficulty(), "easy");
        String hint = StringUtils.defaultString(caseEntity.getHint());
        String targetDescription = StringUtils.defaultString(caseEntity.getTargetDescription());

        return ProgramCaseViewDto.builder()
                .id(caseEntity.getId())
                .title(title)
                .shortTitle(StringUtils.defaultIfBlank(config.getShortTitle(), trimCaseTitle(title)))
                .description(StringUtils.defaultString(caseEntity.getDescription()))
                .goal(StringUtils.defaultIfBlank(config.getGoal(), targetDescription))
                .targetDescription(targetDescription)
                .tip(StringUtils.defaultIfBlank(config.getTip(), hint))
                .helperText(StringUtils.defaultIfBlank(config.getHelperText(), hint))
                .hint(hint)
                .taskSteps(sanitizeList(config.getTaskSteps()))
                .availableBlocks(resolveAvailableBlocks(config.getAvailableBlocks()))
                .focusBlocks(sanitizeList(config.getFocusBlocks()))
                .difficulty(difficulty)
                .difficultyLabel(StringUtils.defaultIfBlank(config.getDifficultyLabel(), resolveDifficultyLabel(difficulty)))
                .minStars(caseEntity.getMinStars() == null ? 1 : caseEntity.getMinStars())
                .cover(caseEntity.getCover())
                .coverEmoji(StringUtils.defaultString(config.getCoverEmoji()))
                .knowledgePoints(sanitizeList(config.getKnowledgePoints()))
                .character(StringUtils.defaultIfBlank(caseEntity.getCharacter(), "cat"))
                .backgroundId(StringUtils.defaultIfBlank(config.getBackgroundId(), "default"))
                .stage(normalizeStage(config.getStage()))
                .evaluation(normalizeEvaluation(config.getEvaluation()))
                .initialWorkspace(StringUtils.defaultString(caseEntity.getInitialWorkspace()))
                .status(caseEntity.getStatus() == null ? 1 : caseEntity.getStatus())
                .sortOrder(caseEntity.getSortOrder() == null ? caseEntity.getId() : caseEntity.getSortOrder())
                .build();
    }

    private ProgramCaseConfigPayload parseCaseConfig(String rawConfig) {
        if (StringUtils.isBlank(rawConfig)) {
            return new ProgramCaseConfigPayload();
        }

        try {
            return objectMapper.readValue(rawConfig, ProgramCaseConfigPayload.class);
        } catch (Exception error) {
            log.warn("解析案例配置失败，case_config={}", rawConfig, error);
            return new ProgramCaseConfigPayload();
        }
    }

    private List<String> sanitizeList(List<String> items) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
                .filter(StringUtils::isNotBlank)
                .map(String::trim)
                .collect(Collectors.toList());
    }

    private List<String> resolveAvailableBlocks(List<String> availableBlocks) {
        List<String> sanitized = sanitizeList(availableBlocks);
        return sanitized.isEmpty() ? DEFAULT_AVAILABLE_BLOCKS : sanitized;
    }

    private JsonNode normalizeStage(JsonNode source) {
        ObjectNode stage = objectMapper.createObjectNode();
        stage.set("start", createDefaultStartNode());
        stage.putNull("target");
        stage.set("stars", objectMapper.createArrayNode());
        stage.set("obstacles", objectMapper.createArrayNode());
        stage.set("guidePoints", objectMapper.createArrayNode());

        if (source != null && source.isObject()) {
            ObjectNode sourceObject = (ObjectNode) source.deepCopy();
            JsonNode sourceStart = sourceObject.get("start");
            sourceObject.remove("start");
            stage.setAll(sourceObject);

            ObjectNode mergedStart = createDefaultStartNode();
            if (sourceStart != null && sourceStart.isObject()) {
                mergedStart.setAll((ObjectNode) sourceStart.deepCopy());
            }
            stage.set("start", mergedStart);
        }

        ensureArrayField(stage, "stars");
        ensureArrayField(stage, "obstacles");
        ensureArrayField(stage, "guidePoints");
        if (!stage.has("target")) {
            stage.putNull("target");
        }
        return stage;
    }

    private JsonNode normalizeEvaluation(JsonNode source) {
        ObjectNode evaluation = objectMapper.createObjectNode();
        evaluation.put("type", "reach-target");
        evaluation.put("tolerance", 9);

        if (source != null && source.isObject()) {
            evaluation.setAll((ObjectNode) source.deepCopy());
        }

        return evaluation;
    }

    private ObjectNode createDefaultStartNode() {
        ObjectNode start = objectMapper.createObjectNode();
        start.put("x", 8);
        start.put("y", 44);
        start.put("direction", 3);
        return start;
    }

    private void ensureArrayField(ObjectNode target, String fieldName) {
        JsonNode current = target.get(fieldName);
        if (current == null || !current.isArray()) {
            ArrayNode emptyArray = objectMapper.createArrayNode();
            target.set(fieldName, emptyArray);
        }
    }

    private String trimCaseTitle(String title) {
        if (StringUtils.isBlank(title)) {
            return "";
        }

        return title.replaceFirst("^关卡\\s*\\d+\\s*[：:、-]?\\s*", "").trim();
    }

    private String resolveDifficultyLabel(String difficulty) {
        switch (StringUtils.defaultString(difficulty)) {
            case "easy":
                return "简单关";
            case "medium":
                return "进阶关";
            case "hard":
                return "挑战关";
            default:
                return "关卡";
        }
    }
}
