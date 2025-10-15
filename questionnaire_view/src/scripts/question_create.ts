import axios from 'axios'
import { useUserStore } from '../stores/userStore'
async function create_question(
  questionType: string,
  options: string,
  title: string,
  description?: string,
) {
  console.log('Creating question with:', {
    questionType,
    options,
    title,
    description,
  })

  return await axios
    .post('http://localhost:8081/question/create', {
      questionType: questionType,
      questionOptions: options,
      questionTitle: title,
      questionTxt: description,
    })
    .then((response) => {
      console.log('request successful:', response)
      if (response.data != 'fail') {
        console.log('Create question successful')
        if (useUserStore().isLoggedIn) {
          useUserStore().addQuestionId(response.data.questionId)
        }
        return true
      } else {
        console.log('Create question failed')
        return false
      }
    })
    .catch((Error) => {
      console.error('Error:', Error)
      return false
    })
}

export { create_question }
