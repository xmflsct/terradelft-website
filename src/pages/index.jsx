import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import { Button, Col, Container, Row } from "react-bootstrap"

import ObjectGrid from "../components/layout/object-grid"

const Index = ({ location }) => {
  const [toggleNav, setToggleNav] = React.useState(false)

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
                ...GatsbyContentfulFluid
              }
            }
          }
        }
      }
    }
  `)
  return (
    <Layout
      location={location}
      name="Terra Delft"
      SEOtitle="Terra Delft"
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <ObjectGrid objects={data.artists.edges} type="artist" location={location}/>
    </Layout>
  )
}

export default Index
