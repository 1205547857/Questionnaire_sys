package org.fofen1.questionnaire.service;

import org.fofen1.questionnaire.entity.Questionnaire;

import java.util.List;

public interface QuestionnaireService {
    //添加问卷
    public Questionnaire createQuestionnaire(Questionnaire questionnaire);
    //删除问卷
    public boolean deleteQuestionnaire(String id);
    //修改问卷
    public Questionnaire updateQuestionnaire(Questionnaire questionnaire);
    //查询问卷
    public Questionnaire searchQuestionnaire(String id);
    //获取活跃问卷
    public List<Questionnaire> getActiveQuestionnaire();
    //获取所有问卷
    public List<Questionnaire> getAllQuestionnaire();
}
