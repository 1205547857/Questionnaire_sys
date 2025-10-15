package org.fofen1.questionnaire.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.io.Serializable;

//用户信息实体类
@Component
@Data
@TableName("user")
public class UserInfo implements Serializable {
    @TableId
    private String userId;
    private String userEmail;
    private String userName;
    private String userPw;
    private String userData;
    private String role;
    @Schema(example = "active|freeze")
    private String userStatus;
}
