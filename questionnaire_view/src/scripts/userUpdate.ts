import axios from 'axios'

export interface UserInfo {
  userId: string
  userEmail: string
  userName: string
  userPw: string
  userData: string
}

async function updateUserInfo(
  userId: string,
  userEmail: string,
  userName: string,
  userPw: string,
  userData: string,
) {
  return axios
    .post('http://localhost:8081/user/edit', {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      userPw: userPw,
      userData: userData,
    })
    .then((response) => {
      console.log('request successful:', response)
      if (response.data != 'fail') {
        console.log('Update successful')
        return true
      } else {
        console.log('Update failed')
        return false
      }
    })
    .catch((Error) => {
      console.error('Error:', Error)
      return false
    })
}

export { updateUserInfo }
