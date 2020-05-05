import React from "react"
import { useTranslation } from "react-i18next"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../layouts/layout"

const Static404 = () => {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "static-404/404.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 870, quality: 80) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t } = useTranslation("static-404")

  return (
    <Layout
      SEOtitle={t("name")}
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
      containerName='static-404'
    >
      <h1>{t("content.heading")}</h1>
      <Img fluid={image.file.childImageSharp.fluid} />
    </Layout>
  )
}

export default Static404
