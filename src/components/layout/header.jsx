import React, { useContext } from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { AlternateLinksContext } from "../wrapWithI18nProvider"

const Header = () => {
  const alternateLinks = useContext(AlternateLinksContext)
  const { t, i18n } = useTranslation("common")
  const image = useStaticQuery(graphql`
    {
      logoLargeNL: file(
        relativePath: { regex: "/(header/logo-large.nl.png)/" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      logoLargeEN: file(
        relativePath: { regex: "/(header/logo-large.en.png)/" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)

  return (
    <Row as="header">
      <Col lg={9} md={12} className="header-left">
        <Link to={`/${i18n.language}`}>
          <Img
            fluid={
              i18n.language === "nl"
                ? image.logoLargeNL.childImageSharp.fluid
                : image.logoLargeEN.childImageSharp.fluid
            }
          />
        </Link>
      </Col>
      <Col lg={3} className="header-right">
        <Row className="language-switcher">
          {alternateLinks &&
            alternateLinks.map(link => (
              <Col lg={12} key={link.language}>
                <Link
                  to={link.path}
                  className={
                    link.language === i18n.language ? "active" : "inactive"
                  }
                  hrefLang={link.language}
                >
                  {t(link.language)}
                </Link>
              </Col>
            ))}
        </Row>
      </Col>
    </Row>
  )
}

export default Header
