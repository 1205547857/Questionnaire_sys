package org.fofen1.questionnaire.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.fofen1.questionnaire.entity.QuestionnaireModel;
import org.fofen1.questionnaire.service.QuesModelService;
import org.fofen1.questionnaire.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("model")
@Tag(name = "问卷模版处理")
@RequestMapping("model")
@CrossOrigin
public class QuesModelController {
    @Autowired
    QuesModelService quesModelService;

    @PostMapping("/create")
    public QuestionnaireModel createModel(@RequestBody QuestionnaireModel questionnaireModel) {
        questionnaireModel.setModelId(UUID.randomUUID().toString());
        if(quesModelService.createModel(questionnaireModel)){
            return questionnaireModel;
        }
        return null;
    }
    @DeleteMapping("/delete/{id}")
    public boolean deleteModel(@PathVariable(value = "id") String id) {
        return quesModelService.deleteModel(id);
    }
    @PostMapping("/edit")
    public QuestionnaireModel editModel(@RequestBody QuestionnaireModel questionnaireModel) {
        return quesModelService.updateModel(questionnaireModel);
    }
    @GetMapping("/search/{id}")
    public QuestionnaireModel searchModel(@PathVariable(name = "id") String id) {
        return quesModelService.searchModelById(id);
    }
}
