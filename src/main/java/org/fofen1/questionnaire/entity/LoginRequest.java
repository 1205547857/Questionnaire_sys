package org.fofen1.questionnaire.entity;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

//登录信息DTO
@Data
@Component
public class LoginRequest implements Serializable {
    private String userEmail;
    private String userPw;
}
