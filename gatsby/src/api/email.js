import ky from "ky-universal"

export async function sendEmail(token, data) {
  try {
    return await ky
      .post("https://api.terra-delft.nl/api/email", {
        json: {
          token: token,
          data: data,
        },
      })
      .json()
  } catch (error) {
    return error.response.json()
  }
}
