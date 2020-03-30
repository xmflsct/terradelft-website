import React from "react"
import { useTranslation } from "react-i18next"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../layouts/layout"

const Index = props => {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { regex: "/(404/404.jpg)/" }) {
        childImageSharp {
          fluid(maxWidth: 800) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t } = useTranslation("404")

  return (
    <Layout
      title={"404 " + t("title")}
      SEOtitle={"404 " + t("title")}
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <h1>404 {t("title")}</h1>
      <Img fluid={image.file.childImageSharp.fluid} />
    </Layout>
  )
}

export default Index
