import ky from "ky-universal"

export async function checkout(token, data) {
  try {
    return await ky
      .post(`${window.location.origin}/api/checkout`, {
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
