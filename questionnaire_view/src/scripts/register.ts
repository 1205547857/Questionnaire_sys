import axios from 'axios'
import { useUserStore } from '../stores/userStore'
function register(userName: string, userEmail: string, userPassword: string) {
  axios
    .post('http://localhost:8080/user/register', {
      userEmail: userEmail,
      userPw: userPassword,
      userName: userName,
    })
    .then((response) => {
      console.log('request successful:', response)
      if (response.data != 'fail') {
        console.log('Registration successful')
        useUserStore().login(userName, userEmail, 'user')
      }
    })
    .catch((Error) => {
      console.error('Error:', Error)
    })
}
export { register }
