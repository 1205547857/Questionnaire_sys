package org.fofen1.questionnaire.service;

import org.fofen1.questionnaire.entity.Question;

import java.util.List;

public interface QuestionService {
    //添加问题
    public boolean createQuestion(Question question);
    //删除问题
    public boolean deleteQuestionById(String id);
    //搜索问题
    public Question searchQuestionById(String id);
    //修改问题
    public Question updateQuestion(Question question);
    //获取所以已分享问题
    public List<Question> getSharedQuestion();
}
