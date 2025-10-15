package org.fofen1.questionnaire.entity;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Data
@Component
public class LoginResponse implements Serializable {
    private String userId;
    private String userEmail;
    private String userName;
    private String role;
    private String userData;
    private String token;
}
