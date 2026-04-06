package com.kidsprogramming.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * program_case.case_config JSON 配置
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProgramCaseConfigPayload {

    private String shortTitle;

    private String goal;

    private String tip;

    private String helperText;

    private List<String> taskSteps = new ArrayList<>();

    private List<String> availableBlocks = new ArrayList<>();

    private List<String> focusBlocks = new ArrayList<>();

    private String difficultyLabel;

    private String coverEmoji;

    private List<String> knowledgePoints = new ArrayList<>();

    private String backgroundId;

    private JsonNode stage;

    private JsonNode evaluation;
}
