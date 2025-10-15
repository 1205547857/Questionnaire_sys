package org.fofen1.questionnaire.service.impl;

import org.fofen1.questionnaire.dao.QuesAnswerMapper;
import org.fofen1.questionnaire.entity.QuestionnaireAnswer;
import org.fofen1.questionnaire.service.QuesAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuesAnswerServiceImpl implements QuesAnswerService {
    @Autowired
    QuesAnswerMapper mapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "getQuesAnswers",
            key = "'getQuesAnswers:'+#questionnaireAnswer.questionnaireId")
    public boolean createQuesAnswer(QuestionnaireAnswer questionnaireAnswer) {
        Map<String, Object> map = new HashMap<>();
        map.put("questionnaire_id", questionnaireAnswer.getQuestionnaireId());
        map.put("writer_ip", questionnaireAnswer.getWriterIp());
        List<QuestionnaireAnswer> questionnaireAnswers = mapper.selectByMap(map);
        return questionnaireAnswers.size() < 20 && mapper.insert(questionnaireAnswer) > 0;
    }

    @Override
    @Cacheable(cacheNames = "getQuesAnswers",
            key = "'getQuesAnswers:'+#questionnaireId")
    public List<QuestionnaireAnswer> getQuesAnswers(String questionnaireId) {
        Map<String,Object> map = new HashMap<>();
        map.put("questionnaire_id",questionnaireId);
        return mapper.selectByMap(map);
    }
}
