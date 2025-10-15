package org.fofen1.questionnaire.entity;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@Component
public class UserData implements Serializable {
    public List<String> questionnaireIds = new ArrayList<>();
    public List<String> questionIds = new ArrayList<>();
    public List<String> QuestionnaireModelIds = new ArrayList<>();
}
