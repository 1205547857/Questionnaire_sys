package org.fofen1.questionnaire.service;

import org.fofen1.questionnaire.entity.LoginRequest;
import org.fofen1.questionnaire.entity.LoginResponse;
import org.fofen1.questionnaire.entity.UserInfo;

import java.util.List;

public interface UserService {
    //用户注册
    public boolean regist(UserInfo userInfo);
    //用户登录
    public UserInfo login(LoginRequest loginRequest);
    //生成token
    public String getToken(LoginRequest loginRequest);
    //解析token
    public UserInfo checkToken(String token);
    //通过id查询用户信息
    public UserInfo getUserInfoById(String userId);
    //修改用户信息
    public UserInfo changeUserInfo(UserInfo userInfo);
    //获取所有用户数据
    public List<UserInfo> getAllUser(String adminToken);
    //删除用户
    public boolean deleteUser(String userId);
}
