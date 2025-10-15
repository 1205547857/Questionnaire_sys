package org.fofen1.questionnaire.controller;

import com.alibaba.fastjson.JSON;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.fofen1.questionnaire.entity.Questionnaire;
import org.fofen1.questionnaire.entity.QuestionnaireStatus;
import org.fofen1.questionnaire.service.QuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@RestController
@Tag(name = "问卷处理")
@RequestMapping("questionnaire")
@CrossOrigin
public class QuestionnaireController {
    @Autowired
    QuestionnaireService questionnaireService;
    @PostMapping("/create")
    public Questionnaire createQuestionnaire(@RequestBody Questionnaire questionnaire) {
        questionnaire.setQuestionnaireId(UUID.randomUUID().toString());
        questionnaire.setQuestionnaireCensor("uncensor");
        return questionnaireService.createQuestionnaire(questionnaire);
    }
    @DeleteMapping("/delete/{id}")
    public boolean deleteQuestionnaire(@PathVariable(value = "id") String id) {
        return questionnaireService.deleteQuestionnaire(id);
    }
    @GetMapping("/search/{id}")
    public Questionnaire searchQuestionnaire(@PathVariable(name = "id") String id) {
        return questionnaireService.searchQuestionnaire(id);
    }
    @PostMapping("/edit")
    public Questionnaire editQuestionnaire(@RequestBody Questionnaire questionnaire) {
        return questionnaireService.updateQuestionnaire(questionnaire);
    }
    @GetMapping("/getAllQuestionnaire")
    public List<Questionnaire> getAllQuestionnaire() {
        return questionnaireService.getAllQuestionnaire();
    }
}
