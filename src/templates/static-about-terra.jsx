import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"

const StaticAboutTerra = ({ data }) => {
  const { t } = useTranslation("static-about-terra")

  return (
    <Layout
      SEOtitle={t("static-about-terra:name")}
      SEOkeywords={[t("static-about-terra:name"), "Terra Delft"]}
      containerName='static-about-terra'
    >
      <h1>{t("static-about-terra:name")}</h1>
      <Row>
        <Col sm={6}>
          {documentToReactComponents(data.aboutTerra.columnLeft.json)}
        </Col>
        <Col sm={6}>
          {documentToReactComponents(data.aboutTerra.columnRight.json)}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>{t("static-about-terra:content.staff")}</h2>
          {data.aboutTerra.staff.map((s) => (
            <Row key={s.name}>
              <Col sm={2}>
                <Img fluid={s.avatar.fluid} />
                <figcaption>{s.name}</figcaption>
              </Col>
              <Col sm={10}>{documentToReactComponents(s.biography.json)}</Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Layout>
  )
}

export const query = graphql`
  query staticAboutTerra($locale: String) {
    aboutTerra: contentfulInformationAboutTerra(node_locale: { eq: $locale }) {
      columnLeft {
        json
      }
      columnRight {
        json
      }
      staff {
        name
        avatar {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid_withWebp
          }
        }
        biography {
          json
        }
      }
    }
  }
`

export default StaticAboutTerra
