import axios from 'axios'
import { CheckoutRequest } from '../checkout'

const recaptcha = (key: string, req: CheckoutRequest) => {
  if (!req.body.token) {
    return {
      success: false,
      error: '[checkout - checkRecaptcha] No token is provided'
    }
  }

  return axios({
    method: 'get',
    url: 'https://www.google.com/recaptcha/api/siteverify',
    params: {
      secret: key,
      response: req.body.token,
      remoteip: req.socket.remoteAddress
    }
  })
    .then(({ data }) => {
      if (data.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: '[checkout - checkRecaptcha] User cannot be verified'
        }
      }
    })
    .catch(() => ({
      success: false,
      error: '[checkout - checkRecaptcha] User cannot be verified'
    }))
}

export default recaptcha
