package org.fofen1.questionnaire.service;

import org.fofen1.questionnaire.entity.QuestionnaireModel;
import org.springframework.web.bind.annotation.RequestBody;

public interface QuesModelService {
    //添加模版
    public boolean createModel(@RequestBody QuestionnaireModel questionnaireModel);
    //删除模版
    public boolean deleteModel(String id);
    //更改模版
    public QuestionnaireModel updateModel(@RequestBody QuestionnaireModel questionnaireModel);
    //搜索模版
    public QuestionnaireModel searchModelById(String id);
}
