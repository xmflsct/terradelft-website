import React from "react"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"

import Layout from "../layouts/layout"
import Grid from "../components/grid"

const OnlineShop = ({ data }) => {
  const { t } = useTranslation("static-online-shop")

  return (
    <Layout SEOtitle={t("name")} SEOkeywords={[t("name"), "Terra Delft"]}>
      <Grid items={data.objects.edges} type='object' />
    </Layout>
  )
}

export const query = graphql`
  query staticOnlineShop($language: String) {
    objects: allContentfulObjectsObjectMain(
      filter: { sellOnline: { eq: true }, node_locale: { eq: $language } }
    ) {
      edges {
        node {
          node_locale
          images {
            fluid(maxWidth: 800) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          name
          artist {
            artist
          }
        }
      }
    }
  }
`

export default OnlineShop
