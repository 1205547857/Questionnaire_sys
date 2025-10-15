package org.fofen1.questionnaire.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import org.fofen1.questionnaire.dao.UserMapper;
import org.fofen1.questionnaire.entity.LoginRequest;
import org.fofen1.questionnaire.entity.UserData;
import org.fofen1.questionnaire.entity.UserInfo;
import org.fofen1.questionnaire.service.UserService;
import org.fofen1.questionnaire.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    UserMapper mapper;
    JwtUtil jwtUtil = new JwtUtil();

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "getAllUser",
            allEntries = true)
    public boolean regist(UserInfo userInfo) {
        return mapper.insert(userInfo)>0;
    }

    @Override
    public UserInfo login(LoginRequest loginRequest) {
        Map map = new HashMap();
        map.put("user_email",loginRequest.getUserEmail());
        map.put("user_pw",loginRequest.getUserPw());
        UserInfo userInfo = (UserInfo) mapper.selectByMap(map).get(0);
        if(userInfo!=null && userInfo.getUserStatus().equals("active")){
            return userInfo;
        }
        throw new RuntimeException("用户不存在或状态异常");
    }

    @Override
    public String getToken(LoginRequest loginRequest){
        Map map = new HashMap();
        map.put("user_email",loginRequest.getUserEmail());
        map.put("user_pw",loginRequest.getUserPw());
        List<UserInfo> list = mapper.selectByMap(map);
        return jwtUtil.generateToken(JSON.toJSONString(list.get(0)));
    }

    @Override
    public UserInfo checkToken(String token) {
        try {
            // 尝试解析和验证Token
            Claims claims = jwtUtil.parseToken(token);
            String tokenInfo = claims.get("content").toString();
            JSONObject jsonObject = JSON.parseObject(tokenInfo);
            return getUserInfoById(jsonObject.getString("userId"));
        } catch (ExpiredJwtException e) {
            // Token过期
            throw new RuntimeException("登录状态已过期，请重新登录", e);
        } catch (SignatureException | MalformedJwtException e) {
            // 签名无效或Token格式错误处理
            throw new RuntimeException("无效的登录状态", e);
        } catch (Exception e) {
            // 捕获其他可能的异常，如IllegalArgumentException等
            throw new RuntimeException("登录状态验证失败", e);
        }
    }

    @Override
    @Cacheable(cacheNames = "getUserInfoById",
            key = "'getUserInfoById:'+#userId")
    public UserInfo getUserInfoById(String userId) {
        return mapper.selectById(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "getAllUser",
                    allEntries = true),
            @CacheEvict(cacheNames = "getUserInfoById",
                    key = "'getUserInfoById:'+#userInfo.userId")
    })
    public UserInfo changeUserInfo(UserInfo userInfo) {
        if(userInfo.getUserPw()=="" || userInfo.getUserPw()==null){
            userInfo.setUserPw(getUserInfoById(userInfo.getUserId()).getUserPw());
        }
        return mapper.updateById(userInfo)>0?userInfo:null;
    }

    @Override
    @Cacheable(cacheNames = "getAllUser")
    public List<UserInfo> getAllUser(String adminToken) {
        UserInfo adminInfo = checkToken(adminToken);
        System.out.println(adminInfo);
        if(adminInfo!=null && adminInfo.getRole().equals("admin")){
            return  mapper.selectByMap(new HashMap());
        }
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @Caching(evict = {
            @CacheEvict(cacheNames = "getAllUser",
                    allEntries = true),
            @CacheEvict(cacheNames = "getUserInfoById",
                    key = "'getUserInfoById:'+#userId")
    })
    public boolean deleteUser(String userId) {
        return mapper.deleteById(userId)>0;
    }
}
