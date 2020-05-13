const ky = require("ky-universal")

async function check(key, req) {
  if (!req.body.token) {
    return {
      success: false,
      error: "[checkout - checkRecaptcha] No token is provided",
    }
  }

  const response = await ky
    .get("https://www.google.com/recaptcha/api/siteverify", {
      searchParams: {
        secret: key,
        response: req.body.token,
        remoteip: req.connection.remoteAddress,
      },
    })
    .json()

  if (response.success) {
    return { success: true }
  } else {
    return {
      success: false,
      error: "[checkout - checkRecaptcha] User cannot be verified",
    }
  }
}

module.exports.check = check
