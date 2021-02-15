import axios from 'axios'

const urlDevelopment = 'http://localhost:3000'
const urlProduction = `https://${process.env.GATSBY_API_ENDPOINT}`

const sendEmail = async (token, data) => {
  const baseUrl =
    // @ts-ignore
    process.env.NODE_ENV === 'production' ? urlProduction : urlDevelopment

  return await axios({
    method: 'post',
    url: `${baseUrl}/api/email`,
    data: {
      token: token,
      data: data
    }
  }).then(res => res.data)
}

export default sendEmail
