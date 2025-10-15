package org.fofen1.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Data
@TableName("questionnaire_model")
@Component
public class QuestionnaireModel implements Serializable {
    @TableId
    private String modelId;
    @Schema(example = "[\"问题一的id\",\"问题二的id\"]")
    private String questionsArray;
    @Schema(example = "0|1")
    private int canDelete;
    private String modelTitle;
    private String modelDesc;
}
