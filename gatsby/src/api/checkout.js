import ky from 'ky-universal'
import * as Sentry from '@sentry/browser'

const urlDevelopment = 'http://localhost:3000'
const urlProduction = `https://${process.env.GATSBY_API_ENDPOINT}`

export async function checkout (token, data) {
  Sentry.configureScope(function (scope) {
    scope.setExtra('URL', urlProduction)
    scope.setExtra('Data', data)
  })
  try {
    const response = await ky.post(
      `${
        process.env.NODE_ENV === 'production' ? urlProduction : urlDevelopment
      }/api/checkout`,
      {
        json: {
          token: token,
          data: data
        }
      }
    )
    Sentry.configureScope(function (scope) {
      scope.setExtra('Response', response)
    })
    return response.json()
  } catch (error) {
    Sentry.captureException(error)
    return error
  }
}
