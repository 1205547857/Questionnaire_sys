package org.fofen1.questionnaire.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.fofen1.questionnaire.entity.Questionnaire;
import org.fofen1.questionnaire.service.QuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.xml.crypto.Data;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

@Component
public class ScheduledController {
    @Autowired
    QuestionnaireService questionnaireService;
    @Scheduled(cron = "0 0 0 * * ?")
    public void activeQuestionnaireCheck(){
        List<Questionnaire> activeList = questionnaireService.getActiveQuestionnaire();
        for (Questionnaire questionnaire : activeList) {
            String timeStr = JSON.parseObject(questionnaire.getQuestionnaireStatus()).getString("endDate");
            if(timeStr!=null){
                Date endDate = new Date(Long.parseLong(timeStr));
                Date nowDate = new Date();
                if(nowDate.after(endDate)){
                    System.out.println(questionnaire+"已过去取");
                    JSONObject jsonObject = JSON.parseObject(questionnaire.getQuestionnaireStatus());
                    jsonObject.put("active", false);
                    questionnaire.setQuestionnaireStatus(JSON.toJSONString(jsonObject));
                    questionnaireService.updateQuestionnaire(questionnaire);
                }
            }
        }
    }
}
