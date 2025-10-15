package org.fofen1.questionnaire.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.fofen1.questionnaire.dao.QuesModelMapper;
import org.fofen1.questionnaire.dao.QuestionMapper;
import org.fofen1.questionnaire.entity.QuestionnaireModel;
import org.fofen1.questionnaire.service.QuesModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class QuesModelServiceImpl implements QuesModelService {
    @Autowired
    QuesModelMapper mapper;
    @Autowired
    QuestionMapper questionMapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createModel(QuestionnaireModel questionnaireModel) {
        if(mapper.insert(questionnaireModel)>0){
            List<String> idList=JSON.parseArray(questionnaireModel.getQuestionsArray(),String.class);
            for (String id : idList) {
                questionMapper.addDepend(id);
            }
            return true;
        }
        return false;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "searchModelById",
            key = "'searchModelById:'+#questionnaireModel.modelId")
    public boolean deleteModel(String modelId) {
        QuestionnaireModel questionnaireModel = mapper.selectById(modelId);
        if(questionnaireModel.getCanDelete()==0 && mapper.deleteById(modelId)>0){
            List<String> idList=JSON.parseArray(questionnaireModel.getQuestionsArray(),String.class);
            for (String id : idList) {
                questionMapper.deleteDepend(id);
            }
            return true;
        }
        return false;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "searchModelById",
            key = "'searchModelById:'+#questionnaireModel.modelId")
    public QuestionnaireModel updateModel(QuestionnaireModel questionnaireModel) {
        List<String> newIdList=JSON.parseArray(questionnaireModel.getQuestionsArray(),String.class);
        List<String> oldIdList=JSON.parseArray(mapper.selectById(questionnaireModel.getModelId()).getQuestionsArray(),String.class);
        if(questionnaireModel.getCanDelete()==0 && mapper.updateById(questionnaireModel)>0){
            for(String oldId : oldIdList){
                questionMapper.deleteDepend(oldId);
            }
            for(String newId : newIdList){
                questionMapper.addDepend(newId);
            }
            return questionnaireModel;
        }
        if(questionnaireModel.getCanDelete()!=0){
            System.out.println("触发创建新模版"+questionnaireModel.toString());
            QuestionnaireModel newQuestionModel = questionnaireModel;
            newQuestionModel.setModelId(UUID.randomUUID().toString());
            newQuestionModel.setCanDelete(0);
            if(createModel(newQuestionModel)){
                return newQuestionModel;
            }
        }
        return null;
    }

    @Override
    @Cacheable(cacheNames = "searchModelById",
            key = "'searchModelById:'+#modelId")
    public QuestionnaireModel searchModelById(String modelId) {
        return mapper.selectById(modelId);
    }
}
