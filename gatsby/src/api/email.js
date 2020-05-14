import ky from 'ky-universal'

export async function sendEmail (token, data) {
  try {
    return await ky
      .post(`https://${process.env.GATSBY_API_ENDPOINT}/api/email`, {
        json: {
          token: token,
          data: data
        }
      })
      .json()
  } catch (error) {
    return error.response.json()
  }
}
