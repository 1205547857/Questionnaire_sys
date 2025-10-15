package org.fofen1.questionnaire.service.impl;

import org.fofen1.questionnaire.dao.QuesAnswerMapper;
import org.fofen1.questionnaire.dao.QuesModelMapper;
import org.fofen1.questionnaire.dao.QuestionnaireMapper;
import org.fofen1.questionnaire.entity.Questionnaire;
import org.fofen1.questionnaire.service.QuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuestionnaireServiceImpl implements QuestionnaireService {
    @Autowired
    QuestionnaireMapper mapper;
    @Autowired
    QuesModelMapper modelMapper;
    @Autowired
    QuesAnswerMapper answerMapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "getActiveQuestionnaire",
                    allEntries = true),
            @CacheEvict(cacheNames = "getAllQuestionnaire",
                    allEntries = true)
    })
    public Questionnaire createQuestionnaire(Questionnaire questionnaire) {
        if (mapper.insert(questionnaire)>0){
            modelMapper.addDepend(questionnaire.getModelId());
            return questionnaire;
        }
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "searchQuestionnaire",
                    key = "'searchQuestionnaire:'+#questionnaireId"),
            @CacheEvict(cacheNames = "getActiveQuestionnaire",
                    allEntries = true),
            @CacheEvict(cacheNames = "getAllQuestionnaire",
                    allEntries = true)
    })
    public boolean deleteQuestionnaire(String questionnaireId) {
        Questionnaire questionnaire = mapper.selectById(questionnaireId);
        Map<String,Object> map = new HashMap<>();
        map.put("questionnaire_id",questionnaireId);
        if(questionnaire.getCanDelete()==0 && answerMapper.selectByMap(map).isEmpty()? true:answerMapper.deleteByMap(map)>0){
            if(mapper.deleteById(questionnaireId)>0){
                modelMapper.deleteDepend(questionnaire.getModelId());
                return true;
            }
            return false;
        }
        return  false;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "searchQuestionnaire",
                    key = "'searchQuestionnaire:'+#questionnaire.questionnaireId"),
            @CacheEvict(cacheNames = "getActiveQuestionnaire",
                    allEntries = true),
            @CacheEvict(cacheNames = "getAllQuestionnaire",
                    allEntries = true)
    })
    public Questionnaire updateQuestionnaire(Questionnaire questionnaire) {
        return mapper.updateById(questionnaire)>0?questionnaire:null;
    }

    @Override
    @Cacheable(cacheNames = "searchQuestionnaire",
            key = "'searchQuestionnaire:'+#questionnaireId")
    public Questionnaire searchQuestionnaire(String questionnaireId) {
        return mapper.selectById(questionnaireId);
    }

    @Override
    @Cacheable(cacheNames = "getActiveQuestionnaire")
    public List<Questionnaire> getActiveQuestionnaire() {
        return mapper.getActiveQuestionnaire();
    }

    @Override
    @Cacheable(cacheNames = "getAllQuestionnaire")
    public List<Questionnaire> getAllQuestionnaire() {
        return mapper.selectByMap(new HashMap<>());
    }
}
