import axios from 'axios'

/**
 * 删除问题实体（调用后端API）
 * @param questionId 问题ID
 * @returns Promise<boolean> 删除是否成功
 */
async function deleteQuestionEntity(questionId: string): Promise<boolean> {
  try {
    console.log('Deleting question entity:', questionId)

    const response = await axios.delete(`http://localhost:8081/question/delete/${questionId}`)

    console.log('Delete question entity response:', response)

    if (response.status === 200 && response.data !== 'fail') {
      console.log('Question entity deleted successfully')
      return true
    } else {
      console.log('Failed to delete question entity')
      return false
    }
  } catch (error) {
    console.error('Error deleting question entity:', error)
    return false
  }
}

/**
 * 删除问题（统一调用后端API处理所有删除逻辑）
 * @param questionId 问题ID
 * @returns Promise<{ success: boolean, message?: string }> 删除结果
 */
async function deleteQuestion(questionId: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('Deleting question (backend handles all logic):', questionId)

    const success = await deleteQuestionEntity(questionId)

    if (success) {
      return {
        success: true,
        message: '问题删除成功',
      }
    } else {
      return {
        success: false,
        message: '问题删除失败',
      }
    }
  } catch (error) {
    console.error('Error deleting question:', error)
    return {
      success: false,
      message: '删除过程中发生错误',
    }
  }
}

/**
 * 批量删除问题
 * @param questionIds 问题ID数组
 * @returns Promise<{ success: string[], failed: string[] }> 删除结果
 */
async function deleteMultipleQuestions(
  questionIds: string[],
): Promise<{ success: string[]; failed: string[] }> {
  const results = {
    success: [] as string[],
    failed: [] as string[],
  }

  console.log('Deleting multiple questions:', questionIds)

  try {
    // 并行删除所有问题
    const deletePromises = questionIds.map(async (questionId) => {
      const result = await deleteQuestion(questionId)
      return { id: questionId, success: result.success }
    })

    const deleteResults = await Promise.all(deletePromises)

    // 分类结果
    deleteResults.forEach((result) => {
      if (result.success) {
        results.success.push(result.id)
      } else {
        results.failed.push(result.id)
      }
    })

    console.log(
      `Batch delete completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
    )
    return results
  } catch (error) {
    console.error('Error in batch delete:', error)
    // 如果批量删除失败，将所有ID标记为失败
    results.failed = questionIds
    return results
  }
}

export { deleteQuestion, deleteQuestionEntity, deleteMultipleQuestions }
