import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Grid from "../components/layout/grid"
import { useTranslation } from "react-i18next"

const Index = props => {
  const { t, i18n } = useTranslation("home")
  const data = useStaticQuery(graphql`
  {
    artists: allContentfulObjectsArtist(
      filter: { node_locale: { eq: "nl" } }
    ) {
      edges {
        node {
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
      title="Terra Delft"
      SEOtitle="Terra Delft"
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <Grid items={data.artists.edges} type="artist" />
    </Layout>
  )
}

export default Index
