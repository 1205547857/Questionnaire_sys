package org.fofen1.questionnaire.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.fofen1.questionnaire.entity.Questionnaire;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface QuestionnaireMapper extends BaseMapper<Questionnaire> {
    @Update("UPDATE questionnaire SET can_delete = can_delete+1 WHERE questionnaire_id = #{questionnaire_id}")
    public boolean addDepend(String questionnaire_id);
    @Update("UPDATE questionnaire SET can_delete = can_delete-1 WHERE questionnaire_id = #{questionnaire_id}")
    public boolean deleteDepend(String questionnaire_id);
    @Select("SELECT * FROM questionnaire WHERE JSON_VALUE(questionnaire_status,'$.active')='true'")
    public List<Questionnaire> getActiveQuestionnaire();
}
