import React, { useContext, useEffect, useRef, useState } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { CSSTransition } from "react-transition-group"
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
          fixed(width: 100, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
      logoSmallEN: file(
        relativePath: { eq: "layout-header/logo-small-en.png" }
      ) {
        childImageSharp {
          fixed(width: 100, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
    }
  `)
  const { t, i18n } = useTranslation("constant")
  const alternateLinks = useContext(ContextLanguage)
  const { state } = useContext(ContextBag)
  const { stateMobileMenu, dispatch } = useContext(ContextMobileMenu)
  const [miniBag, setMiniBag] = useState(false)
  const firstMount = useRef(true)

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false
    } else {
      setMiniBag(true)
    }
  }, [state])

  return (
    <header>
      <Row>
        <Col xs={4} sm={3} className='header-hamburger text-left'>
          <Button
            className={`hamburger hamburger--collapse ${
              stateMobileMenu ? "is-active" : ""
            }`}
            variant='link'
            aria-label='Menu'
            onClick={() => dispatch()}
          >
            <span className='hamburger-box'>
              <span className='hamburger-inner'></span>
            </span>
          </Button>
        </Col>
        <Col xs={4} sm={6} md={9} className='header-logo'>
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
              fixed={
                image[`logoSmall${i18n.language.toUpperCase()}`].childImageSharp
                  .fixed
              }
              className='logo-small'
            />
          </Link>
        </Col>
        <Col
          xs={{ span: 2, offset: 0 }}
          sm={{ span: 1, offset: 1 }}
          md={{ span: 2, offset: 0 }}
          className='language-switcher'
        >
          {alternateLinks &&
            alternateLinks.map(
              (link) =>
                link.locale !== i18n.language && (
                  <Link to={link.path} hrefLang={link.locale} key={link.locale}>
                    <FontAwesomeIcon
                      icon={faGlobeEurope}
                      size='sm'
                      fixedWidth
                    />
                    <span className='long small-block'>
                      {" " +
                        t(
                          `constant:header.language-switcher.long.${link.locale}`
                        )}
                    </span>
                    <span className='short small-block'>
                      {" " +
                        t(
                          `constant:header.language-switcher.short.${link.locale}`
                        )}
                    </span>
                  </Link>
                )
            )}
        </Col>
        <Col xs={2} sm={1} md={1} className='bag-link'>
          <Link
            to={t("constant:slug.static.bag.slug", {
              locale: i18n.language,
            })}
          >
            <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
            <span className='small-block'>{` (${state.bag.objects.length})`}</span>
          </Link>
        </Col>
      </Row>
      <CSSTransition
        in={miniBag}
        onEnter={() =>
          setTimeout(() => {
            setMiniBag(false)
          }, 3000)
        }
        timeout={350}
        className='mini-bag'
        classNames='mini-bag'
      >
        <div>{t("constant:header.mini-bag")}</div>
      </CSSTransition>
      <Navigation />
    </header>
  )
}

export default Header
