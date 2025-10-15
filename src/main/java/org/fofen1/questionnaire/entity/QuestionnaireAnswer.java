package org.fofen1.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Data
@Component
@TableName("questionnaire_answer")
public class QuestionnaireAnswer implements Serializable {
    private String questionnaireId;
    @Schema(example = "{\"questionId\":\"相应问题的选项\",\"questionId2\":\"相应问题的选项2\"}")
    private String answer;
    private String writerIp;
}
