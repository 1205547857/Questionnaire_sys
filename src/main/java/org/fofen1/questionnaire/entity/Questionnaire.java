package org.fofen1.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Data
@Component
@TableName("questionnaire")
public class Questionnaire implements Serializable {
    @TableId
    private String questionnaireId;
    private String questionnaireStatus;
    private String modelId;
    @Schema(example = "0|1")
    private int canDelete;
    private String questionnaireTitle;
    @Schema(example = "uncensor|pass|block")
    private String questionnaireCensor;
}
