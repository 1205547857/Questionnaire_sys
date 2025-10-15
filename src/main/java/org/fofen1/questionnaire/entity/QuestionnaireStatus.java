package org.fofen1.questionnaire.entity;

import lombok.Data;

import java.io.Serializable;
import java.sql.Time;
import java.sql.Timestamp;

@Data
public class QuestionnaireStatus implements Serializable {
    private boolean active;
    private Timestamp createdData;
    private Timestamp startDate;
    private Timestamp endDate;
}
