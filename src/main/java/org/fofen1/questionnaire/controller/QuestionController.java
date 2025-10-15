package org.fofen1.questionnaire.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import org.fofen1.questionnaire.entity.Question;
import org.fofen1.questionnaire.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "处理问题组件,返回值未统一！")
@RestController
@RequestMapping("question")
@CrossOrigin
public class QuestionController {
    @Autowired
    QuestionService questionService;
    @PostMapping("/create")
    public Question createQuestion(@RequestBody Question question) {
        question.setQuestionId(UUID.randomUUID().toString());
        question.setShared(0);
        return questionService.createQuestion(question)?question:null;
    }
    @DeleteMapping("/delete/{id}")
    public boolean deleteQuestion(@PathVariable String id) {
        return questionService.deleteQuestionById(id);
    }
    @GetMapping("/search/{id}")
    public Question searchQuestionById(@PathVariable(name = "id") String id) {
        return questionService.searchQuestionById(id);
    }
    @PostMapping("/edit")
    public Question editQuestion(@RequestBody Question question) {
        return questionService.updateQuestion(question);
    }
    @GetMapping("/get-shared")
    public List<Question> getSharedQuestion() {
        return questionService.getSharedQuestion();
    }
}
