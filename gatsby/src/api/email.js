import ky from 'ky-universal'

const urlDevelopment = 'http://localhost:3000'
const urlProduction = `https://${process.env.GATSBY_API_ENDPOINT}`

export async function sendEmail (token, data) {
  try {
    return await ky
      .post(
        `${
          process.env.NODE_ENV === 'production' ? urlProduction : urlDevelopment
        }/api/email`,
        {
          json: {
            token: token,
            data: data
          }
        }
      )
      .json()
  } catch (error) {
    return error.response.json()
  }
}
