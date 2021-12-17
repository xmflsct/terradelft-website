import axios from 'axios'

const api = async <T = unknown>(
  endpoint: string,
  data: T
): Promise<{ sessionId: string }> => {
  let result
  try {
    result = await axios({
      method: 'post',
      url: `/api/${endpoint}`,
      data
    })
  } catch (error: any) {
    console.log(error.response.data)
  } finally {
    return result?.data
  }
}

export default api
