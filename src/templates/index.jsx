import React from "react"
import { useTranslation } from "react-i18next"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../layouts/layout"
import Grid from "../components/grid"

const Index = props => {
  const data = useStaticQuery(graphql`
    {
      artists: allContentfulObjectsArtist(
        filter: { node_locale: { eq: "nl" } }
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
          }
        }
      }
    }
  `)
  const { t } = useTranslation("index")

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

export default Index
