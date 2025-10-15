package org.fofen1.questionnaire.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;
import org.fofen1.questionnaire.entity.QuestionnaireModel;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface QuesModelMapper extends BaseMapper<QuestionnaireModel> {
    @Update("UPDATE questionnaire_model SET can_delete = can_delete+1 WHERE model_id = #{model_id}")
    public boolean addDepend(String model_id);
    @Update("UPDATE questionnaire_model SET can_delete = can_delete-1 WHERE model_id = #{model_id}")
    public boolean deleteDepend(String model_id);
}
