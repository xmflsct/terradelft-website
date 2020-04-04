import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobeEurope, faShoppingBag } from "@fortawesome/free-solid-svg-icons"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import { ContextLanguage } from "./contexts/language"
import { ContextBag } from "./contexts/bag"

const Header = () => {
  const image = useStaticQuery(graphql`
    {
      logoLargeNL: file(
        relativePath: { eq: "layout-header/logo-large.nl.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      logoLargeEN: file(
        relativePath: { eq: "layout-header/logo-large.en.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t, i18n } = useTranslation(["constant"])
  const alternateLinks = useContext(ContextLanguage)
  const { state } = useContext(ContextBag)

  return (
    <Row as='header'>
      <Col lg={9} md={12} className='header-left'>
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
      <Col lg={2} className='header-right'>
        <Row className='language-switcher'>
          <FontAwesomeIcon icon={faGlobeEurope} />
          {alternateLinks &&
            alternateLinks.map((link) => (
              <Col lg={12} key={link.language}>
                <Link
                  to={link.path}
                  className={
                    link.language === i18n.language ? "active" : "inactive"
                  }
                  hrefLang={link.language}
                >
                  {t(`constant:header.language-switcher.${link.language}`)}
                </Link>
              </Col>
            ))}
        </Row>
      </Col>
      <Col lg={1} className='temp'>
        <Link to={"/" + i18n.language + "/" + t("constant:header.bag.url")}>
          <FontAwesomeIcon icon={faShoppingBag} />
          {state.bag.objects.length}
        </Link>
      </Col>
    </Row>
  )
}

export default Header
