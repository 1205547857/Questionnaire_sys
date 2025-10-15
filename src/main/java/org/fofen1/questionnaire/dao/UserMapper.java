package org.fofen1.questionnaire.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.fofen1.questionnaire.entity.LoginRequest;
import org.fofen1.questionnaire.entity.UserInfo;
import org.springframework.stereotype.Repository;

@Repository
@org.apache.ibatis.annotations.Mapper
public interface UserMapper extends BaseMapper<UserInfo> {

}
