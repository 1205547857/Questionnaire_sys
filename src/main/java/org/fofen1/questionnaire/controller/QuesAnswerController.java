package org.fofen1.questionnaire.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.fofen1.questionnaire.entity.QuestionnaireAnswer;
import org.fofen1.questionnaire.service.QuesAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("answer")
@Tag(name="问卷提交处理")
@CrossOrigin
public class QuesAnswerController {
    @Autowired
    QuesAnswerService quesAnswerService;
    @PostMapping("/submit")
    public boolean submitQuesAnswer(@RequestBody QuestionnaireAnswer questionnaireAnswer) {
        return quesAnswerService.createQuesAnswer(questionnaireAnswer);
    }
    @GetMapping("/search/{questionnaireId}")
    public List<QuestionnaireAnswer> searchQuesAnswer(@PathVariable(name = "questionnaireId") String questionnaireId) {
        return quesAnswerService.getQuesAnswers(questionnaireId);
    }
}
