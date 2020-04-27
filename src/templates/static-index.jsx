import React from "react"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"

import Layout from "../layouts/layout"
import GridArtist from "../components/grids/grid-artist"
import GridObjectDefault from "../components/grids/grid-object-default"

const StaticIndex = ({ data }) => {
  const { t } = useTranslation("static-index")

  return (
    <Layout
      SEOtitle='Terra Delft'
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
      containerName='static-index'
    >
      <div className='section-online-shop mb-3'>
        <h2>{t("content.section.online-shop")}</h2>
        <GridObjectDefault
          nodes={data.objects.nodes}
          randomize={true}
          limit={6}
        />
      </div>
      <div className='section-collection'>
        <h1>{t("content.section.collection")}</h1>
        <GridArtist data={data.artists.edges} />
      </div>
    </Layout>
  )
}

export const query = graphql`
  query staticIndex($language: String) {
    objects: allContentfulObjectsObjectMain(
      filter: { sellOnline: { eq: true }, node_locale: { eq: $language } }
      limit: 36
    ) {
      nodes {
        ...ObjectDefault
      }
    }
    artists: allContentfulObjectsArtist(
      filter: { node_locale: { eq: $language } }
      sort: { fields: fields___artist_lastname, order: ASC }
    ) {
      edges {
        node {
          node_locale
          artist
          image {
            fluid(maxWidth: 140) {
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

export default StaticIndex
