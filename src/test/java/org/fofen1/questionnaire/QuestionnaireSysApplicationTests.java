package org.fofen1.questionnaire;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.fofen1.questionnaire.controller.ScheduledController;
import org.fofen1.questionnaire.dao.QuesModelMapper;
import org.fofen1.questionnaire.dao.QuestionMapper;
import org.fofen1.questionnaire.dao.QuestionnaireMapper;
import org.fofen1.questionnaire.dao.UserMapper;
import org.fofen1.questionnaire.entity.*;
import org.fofen1.questionnaire.service.QuesAnswerService;
import org.fofen1.questionnaire.service.UserService;
import org.fofen1.questionnaire.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.annotation.Scheduled;

import java.lang.reflect.Array;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@SpringBootTest
class QuestionnaireSysApplicationTests {
    @Autowired
    UserService userService;
    @Autowired
    QuestionMapper mapper;
    JwtUtil jwtUtil = new JwtUtil();
    @Autowired
    QuestionnaireMapper questionnaireMapper;
    @Autowired
    ScheduledController  scheduledController;
    @Autowired
    QuesAnswerService  quesAnswerService;
    @Test
    void contextLoads() {
        for (int i =0;i<5;i++) {
            try {
                Thread.sleep(1000);
                System.out.println("查询数据：");
                System.out.println(quesAnswerService.getQuesAnswers("474de2fa-ed3d-4ba1-bc47-a357f37e9d04"));
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        QuestionnaireAnswer questionnaireAnswer = new QuestionnaireAnswer();
        questionnaireAnswer.setWriterIp("127.0.0.1");
        questionnaireAnswer.setQuestionnaireId("474de2fa-ed3d-4ba1-bc47-a357f37e9d04");
        questionnaireAnswer.setAnswer("{}");
        if(quesAnswerService.createQuesAnswer(questionnaireAnswer)) {
            System.out.println("插入成功，预期：数据更新，重新进行SQL操作");
        }
        for (int i =0;i<5;i++) {
            try {
                Thread.sleep(1000);
                System.out.println("查询新数据：");
                System.out.println(quesAnswerService.getQuesAnswers("474de2fa-ed3d-4ba1-bc47-a357f37e9d04"));
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
