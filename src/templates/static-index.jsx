import React from "react"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"

import Layout from "../layouts/layout"
import Grid from "../components/grid"

const Index = ({ data }) => {
  const { t } = useTranslation("static-index")

  return (
    <Layout
      SEOtitle='Terra Delft'
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <p>{t("section.collection")}</p>
      <Grid items={data.artists.edges} type='artist' />
    </Layout>
  )
}

export const query = graphql`
  query staticIndex($language: String) {
    artists: allContentfulObjectsArtist(
      filter: { node_locale: { eq: $language } }
      sort: { fields: fields___artist_lastname, order: ASC }
    ) {
      edges {
        node {
          node_locale
          artist
          image {
            fluid(maxWidth: 800) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          fields {
            artist_lastname
          }
        }
      }
    }
  }
`

export default Index
