package org.fofen1.questionnaire.service;

import org.fofen1.questionnaire.entity.Question;
import org.fofen1.questionnaire.entity.Questionnaire;
import org.fofen1.questionnaire.entity.QuestionnaireAnswer;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface QuesAnswerService {
    //提交问卷
    public boolean createQuesAnswer(QuestionnaireAnswer questionnaireAnswer);
    //搜索问卷
    public List<QuestionnaireAnswer> getQuesAnswers(String questionnaireId);
}
