import React from "react"
import { useTranslation } from "react-i18next"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../layouts/layout"

const Index = () => {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "static-404/404.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 800) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t } = useTranslation("static-404")

  return (
    <Layout
      SEOtitle={"404 " + t("title")}
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
      containerName='static-404'
    >
      <h1>404 {t("h1")}</h1>
      <Img fluid={image.file.childImageSharp.fluid} />
    </Layout>
  )
}

export default Index
