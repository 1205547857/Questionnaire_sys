package org.fofen1.questionnaire.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;
import org.fofen1.questionnaire.entity.Question;
import org.springframework.stereotype.Repository;

@Repository
@Mapper
public interface QuestionMapper extends BaseMapper<Question> {
    @Update("UPDATE question SET can_delete = can_delete+1 WHERE question_id = #{question_id}")
    public boolean addDepend(String question_id);
    @Update("UPDATE question SET can_delete = can_delete-1 WHERE question_id = #{question_id}")
    public boolean deleteDepend(String question_id);
}
