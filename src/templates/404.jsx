import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"
import { useTranslation } from "react-i18next"

const Index = props => {
  const { t } = useTranslation("404")
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

  return (
    <Layout
      alternateLink={props.alternateLinks}
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
