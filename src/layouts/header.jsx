import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobeEurope, faShoppingBag } from "@fortawesome/free-solid-svg-icons"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import { ContextLanguage } from "./contexts/language"
import { ContextBag } from "./contexts/bag"

import "../../node_modules/@fortawesome/fontawesome-svg-core/styles.css"

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
  const { t, i18n } = useTranslation(["constant", "static-bag"])
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
      <Col lg={2} className='language-switcher text-right'>
        {alternateLinks &&
          alternateLinks.map(
            (link) =>
              link.locale !== i18n.language && (
                <Link
                  to={link.path}
                  className={
                    link.locale === i18n.language ? "active" : "inactive"
                  }
                  hrefLang={link.locale}
                  key={link.locale}
                >
                  <FontAwesomeIcon icon={faGlobeEurope} size="sm" fixedWidth />
                  {" " +
                    t(`constant:header.language-switcher.${link.locale}`)}
                </Link>
              )
          )}
      </Col>
      <Col lg={1} className='bag-link text-right'>
        <Link to={`/${i18n.language}/${t("static-bag:slug")}`}>
          <FontAwesomeIcon icon={faShoppingBag} size="sm" fixedWidth />
          {` (${state.bag.objects.length})`}
        </Link>
      </Col>
    </Row>
  )
}

export default Header
