package org.fofen1.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
//问题组件

@Data
@TableName("question")
@Component
public class Question implements Serializable {
    @TableId
    private String questionId;
    @Schema(example = "single_choice|multiple_choice|text|dropdown|number|date")
    private String questionType;
    @Schema(example = "[\"question1\",\"question2\"]")
    private String questionOptions;
    @Schema(example = "0|1")
    private int canDelete;
    private String questionTitle;
    private String questionTxt;
    @Schema(example = "0|1")
    private int shared;
}
