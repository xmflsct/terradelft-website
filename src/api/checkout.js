export async function checkout(token, data) {
  console.log(data)
  let response = null
  try {
    response = await fetch(
      window.location.origin + "/api/checkout?token=" + token,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    ).then(res => res.json())
  } catch (err) {
    response = err
  }
  return response
}
