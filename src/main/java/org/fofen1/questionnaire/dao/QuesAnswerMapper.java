package org.fofen1.questionnaire.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;
import org.fofen1.questionnaire.entity.QuestionnaireAnswer;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface QuesAnswerMapper extends BaseMapper<QuestionnaireAnswer> {

}
