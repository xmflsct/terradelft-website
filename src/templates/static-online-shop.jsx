import React from "react"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"

import Layout from "../layouts/layout"
import GridObjectOnlineShop from "../components/grids/grid-object-online-shop"

const OnlineShop = ({ data }) => {
  const { t } = useTranslation("static-online-shop")

  return (
    <Layout
      SEOtitle={t("name")}
      SEOkeywords={[t("name"), "Terra Delft"]}
      containerName='static-online-shop'
    >
      <GridObjectOnlineShop data={data.objects.edges} />
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
          priceOriginal
          priceSale
          fields {
            object_sale
            object_variants
            variations_price_range {
              highest
              lowest
            }
          }
        }
      }
    }
  }
`

export default OnlineShop
