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
      <Col lg={2} className='language-switcher text-right'>
        {alternateLinks &&
          alternateLinks.map(
            (link) =>
              link.language !== i18n.language && (
                <Link
                  to={link.path}
                  className={
                    link.language === i18n.language ? "active" : "inactive"
                  }
                  hrefLang={link.language}
                  key={link.language}
                >
                  <FontAwesomeIcon icon={faGlobeEurope} size="sm" />
                  {" " +
                    t(`constant:header.language-switcher.${link.language}`)}
                </Link>
              )
          )}
      </Col>
      <Col lg={1} className='bag-link text-right'>
        <Link to={`/${i18n.language}/${t("constant:header.bag.url")}`}>
          <FontAwesomeIcon icon={faShoppingBag} size="sm" />
          {` (${state.bag.objects.length})`}
        </Link>
      </Col>
    </Row>
  )
}

export default Header
