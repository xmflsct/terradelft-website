import ky from "ky-universal"

(async () => {
  const response = await ky(
    "https://preview.contentful.com/spaces/laglj5goxt03/environments/20200402-testing/entries/",
    {
      searchParams: {
        access_token: "WNLVdwZD4PqZGSE8Z6BA1m-Qn311a7_w7887hsIRdpk",
        content_type: "objectsObjectVariation",
        "sys.id[in]":
          "36ssijkQ4JblAwYtWgqt78,NpcFcFTaGcjy7pGduQpRt,3bRafMlmfEZye7pvf64QSA,4J1F7ZCPQSclijpH9MVpQs,5FC0rV51ji9sLUzH0wDQg0,5UKHZKYITR6DLtTYtuVgqU,gdrdAXq8lWCsqU436UBZW,59WNG98z8lwuGMpoC7zU5N,mMptJhsuazUHMUhPXsq7g,RLdRENJxMw1o0eazZt9y0,6Ix9AKrcyZ8BUMrDaltQPB,3QQSwwsOn0a6OD7C8UMV57,EgydlG7qDWG9oNaYd4l2Y,1T5RIwxGs6i5X575tkNv4u,4df77gfbwDyXL6U7W77aBC,4rcwGet1O5lnTcum38DR5f,6A0PDjHTFUHFvm0PVThiex,2HWQkX7ViWaGKtSexYrNcF,1Z5iFMjjisbCJoauLPXcvL",
      },
    }
  ).json()

  console.log(response)
})()
