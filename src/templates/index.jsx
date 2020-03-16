import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../components/layout"
import Grid from "../components/layout/grid"
import { useTranslation } from "react-i18next"

const Index = props => {
  const { t } = useTranslation("index")
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

  return (
    <Layout
      alternateLink={props.alternateLinks}
      SEOtitle="Terra Delft"
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <p>{t("section.collection")}</p>
      <Grid items={data.artists.edges} type="artist" />
    </Layout>
  )
}

export default Index
