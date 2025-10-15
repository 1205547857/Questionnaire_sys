package org.fofen1.questionnaire.controller;

import com.alibaba.fastjson.JSON;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.fofen1.questionnaire.entity.LoginRequest;
import org.fofen1.questionnaire.entity.LoginResponse;
import org.fofen1.questionnaire.entity.UserData;
import org.fofen1.questionnaire.entity.UserInfo;
import org.fofen1.questionnaire.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/// ///////////////////////////返回值未统一,以及未处理异常
//用于用户信息相关操作，如注册，登录，修改个人信息等
@Tag(name = "用户信息处理!返回值未同统一")
@RestController
@RequestMapping("/user")
@CrossOrigin
public class UserInfoController {
    @Autowired
    UserService userService;
    @PostMapping("/register")
    public String userRegister(@RequestBody UserInfo userInfo){
        userInfo.setUserId(UUID.randomUUID().toString());
        userInfo.setUserData(JSON.toJSONString(new UserData()));
        userInfo.setUserStatus("active");
        userInfo.setRole(userInfo.getRole()==null? "user":userInfo.getRole());
        return userService.regist(userInfo)? "success":"fail";
    }
    @PostMapping("/login")
    public LoginResponse userLogin(@RequestBody LoginRequest loginRequest,/*, HttpServletResponse response*/Errors errors){
        UserInfo userInfo = new UserInfo();
        if((userInfo = userService.login(loginRequest))!=null){
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setUserName(userInfo.getUserName());
            loginResponse.setUserEmail(userInfo.getUserEmail());
            loginResponse.setUserId(userInfo.getUserId());
            loginResponse.setUserData(userInfo.getUserData());
            loginResponse.setToken(userService.getToken(loginRequest));
            loginResponse.setRole(userInfo.getRole());
            return loginResponse;
        }
        return null;
    }
    //通过id查询用户信息
    @GetMapping("/search/{id}")
    public UserInfo userSearch(@PathVariable String id){
        return userService.getUserInfoById(id);
    }
    //用户信息修改
    @PostMapping("/edit")
    public UserInfo userEdit(@RequestBody UserInfo userInfo){
        return userService.changeUserInfo(userInfo);
    }
    //token信息确认
    @GetMapping("/tokenCheck/{token}")
    public LoginResponse userTokenCheck(@PathVariable(name = "token") String token){
        try {
            UserInfo userInfo = userService.checkToken(token);
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setUserName(userInfo.getUserName());
            loginResponse.setUserEmail(userInfo.getUserEmail());
            loginResponse.setUserId(userInfo.getUserId());
            loginResponse.setUserData(userInfo.getUserData());
            loginResponse.setToken(token);
            loginResponse.setRole(userInfo.getRole());
            return loginResponse;
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }

    }
    @GetMapping("/getAllUser/{adminToken}")
    public List<UserInfo> getAllUser(@PathVariable(value = "adminToken") String adminToken){
        List <UserInfo> userList  = userService.getAllUser(adminToken);
        if(userList!=null){
            return userList;
        }
        return null;
    }

    @DeleteMapping("/delete/{userId}")
    public boolean userDelete(@PathVariable(name = "userId") String userId){
        return userService.deleteUser(userId);
    }
}
