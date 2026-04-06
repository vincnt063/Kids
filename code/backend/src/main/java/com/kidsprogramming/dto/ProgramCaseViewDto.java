package com.kidsprogramming.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 对外返回的完整关卡信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramCaseViewDto {

    private Integer id;

    private String title;

    private String shortTitle;

    private String description;

    private String goal;

    private String targetDescription;

    private String tip;

    private String helperText;

    private String hint;

    private List<String> taskSteps;

    private List<String> availableBlocks;

    private List<String> focusBlocks;

    private String difficulty;

    private String difficultyLabel;

    private Integer minStars;

    private String cover;

    private String coverEmoji;

    private List<String> knowledgePoints;

    private String character;

    private String backgroundId;

    private JsonNode stage;

    private JsonNode evaluation;

    private String initialWorkspace;

    private Integer status;

    private Integer sortOrder;
}
