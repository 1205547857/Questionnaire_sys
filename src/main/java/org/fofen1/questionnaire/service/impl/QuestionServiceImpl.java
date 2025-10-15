package org.fofen1.questionnaire.service.impl;

import org.fofen1.questionnaire.dao.QuestionMapper;
import org.fofen1.questionnaire.entity.Question;
import org.fofen1.questionnaire.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class QuestionServiceImpl implements QuestionService {
    @Autowired
    QuestionMapper mapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "getSharedQuestion",
            allEntries = true)
    public boolean createQuestion(Question question) {
        return mapper.insert(question)>0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "getSharedQuestion",
                    allEntries = true),
            @CacheEvict(cacheNames = "searchQuestionById",
                    key = "'searchQuestionById'+#questionId")
    })
    public boolean deleteQuestionById(String questionId) {
        if(mapper.selectById(questionId).getCanDelete()==0 && mapper.deleteById(questionId)>0){
            return true;
        }
        Question question = mapper.selectById(questionId);
        question.setShared(0);
        mapper.updateById(question);
        return false;
    }

    @Override
    @Cacheable(cacheNames = "searchQuestionById",
            key = "'searchQuestionById:'+#questionId")
    public Question searchQuestionById(String questionId) {
        return mapper.selectById(questionId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "getSharedQuestion",
                    allEntries = true),
            @CacheEvict(cacheNames = "searchQuestionById",
                    key = "'searchQuestionById'+#question.questionId")
    })
    public Question updateQuestion(Question question) {
        if(question.getCanDelete()==0 && mapper.updateById(question)>0){
            return question;
        }
        if(question.getCanDelete()!=0){
            Question newQuestion = question;
            newQuestion.setQuestionId(UUID.randomUUID().toString());
            newQuestion.setCanDelete(0);
            if(createQuestion(newQuestion)){
                return newQuestion;
            }
        }
        return null;
    }
    @Override
    @Cacheable(cacheNames = "getSharedQuestion")
    public List<Question> getSharedQuestion() {
        Map<String,Object> map = new HashMap<>();
        map.put("shared",1);
        return mapper.selectByMap(map);
    }
}
