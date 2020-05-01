import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobeEurope, faShoppingBag } from "@fortawesome/free-solid-svg-icons"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import Navigation from "./navigation"
import { ContextLanguage } from "./contexts/language"
import { ContextBag } from "./contexts/bag"
import { ContextMobileMenu } from "./layout"

import "../../node_modules/@fortawesome/fontawesome-svg-core/styles.css"

const Header = () => {
  const image = useStaticQuery(graphql`
    {
      logoLargeNL: file(
        relativePath: { eq: "layout-header/logo-large-nl.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      logoLargeEN: file(
        relativePath: { eq: "layout-header/logo-large-en.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      logoSmallNL: file(
        relativePath: { eq: "layout-header/logo-small-nl.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 150, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      logoSmallEN: file(
        relativePath: { eq: "layout-header/logo-small-en.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 150, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t, i18n } = useTranslation("constant")
  const alternateLinks = useContext(ContextLanguage)
  const { state } = useContext(ContextBag)
  const { stateMobileMenu, dispatch } = useContext(ContextMobileMenu)

  return (
    <header>
      <Row>
        <Col xs={2} className='header-hamburger'>
          <Button
            className={`hamburger hamburger--collapse ${
              stateMobileMenu ? "is-active" : ""
            }`}
            variant='link'
            onClick={() => dispatch()}
          >
            <span className='hamburger-box'>
              <span className='hamburger-inner'></span>
            </span>
          </Button>
        </Col>
        <Col
          xs={{ span: 6, offset: 1 }}
          md={{ span: 9, offset: 0 }}
          className='header-logo'
        >
          <Link
            to={t("constant:slug.static.index.slug", { locale: i18n.language })}
          >
            <Img
              fluid={
                image[`logoLarge${i18n.language.toUpperCase()}`].childImageSharp
                  .fluid
              }
              className='logo-large'
            />
            <Img
              fluid={
                image[`logoSmall${i18n.language.toUpperCase()}`].childImageSharp
                  .fluid
              }
              className='logo-small'
            />
          </Link>
        </Col>
        <Col xs={2} className='language-switcher text-right'>
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
                    <FontAwesomeIcon
                      icon={faGlobeEurope}
                      size='sm'
                      fixedWidth
                    />
                    {" " +
                      t(`constant:header.language-switcher.${link.locale}`)}
                  </Link>
                )
            )}
        </Col>
        <Col
          xs={{ span: 2, offset: 1 }}
          md={{ span: 1, offset: 0 }}
          className='bag-link text-right'
        >
          <Link
            to={t("constant:slug.static.bag.slug", {
              locale: i18n.language,
            })}
          >
            <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
            {` (${state.bag.objects.length})`}
          </Link>
        </Col>
      </Row>
      <Navigation />
    </header>
  )
}

export default Header
