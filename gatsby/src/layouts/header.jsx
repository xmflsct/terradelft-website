import PropTypes from 'prop-types'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGlobeEurope,
  faSearch,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons'
import { useStaticQuery, graphql, Link } from 'gatsby'
import Img from 'gatsby-image'
import Navigation from './navigation'
import { ContextLanguage } from './contexts/language'
import { ContextMobileMenu } from './layout'
import { getBag } from '../state/slices/bag'
import '../../node_modules/@fortawesome/fontawesome-svg-core/styles.css'
import { sumBy } from 'lodash'

const Header = ({ useMiniBag }) => {
  const data = useStaticQuery(graphql`
    {
      logoLargeNL: file(
        relativePath: { eq: "layout-header/logo-large-nl.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700, quality: 90) {
            ...GatsbyImageSharpFluid_noBase64
          }
        }
      }
      logoLargeEN: file(
        relativePath: { eq: "layout-header/logo-large-en.png" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700, quality: 90) {
            ...GatsbyImageSharpFluid_noBase64
          }
        }
      }
      logoSmallNL: file(
        relativePath: { eq: "layout-header/logo-small-nl.png" }
      ) {
        childImageSharp {
          fixed(width: 100, quality: 90) {
            ...GatsbyImageSharpFixed_noBase64
          }
        }
      }
      logoSmallEN: file(
        relativePath: { eq: "layout-header/logo-small-en.png" }
      ) {
        childImageSharp {
          fixed(width: 100, quality: 90) {
            ...GatsbyImageSharpFixed_noBase64
          }
        }
      }
    }
  `)
  const { t, i18n } = useTranslation('constant')
  const alternateLinks = useContext(ContextLanguage)
  const { stateMobileMenu, dispatch } = useContext(ContextMobileMenu)
  const [miniBag, setMiniBag] = useState(false)
  const [locationOrigin, setLocationOrigin] = useState()

  const bagObjects = useSelector(getBag)

  // useEffect(() => {
  //   if (useMiniBag) {
  //     if (firstMount.current) {
  //       firstMount.current = false
  //     } else {
  //       setMiniBag(true)
  //     }
  //   }
  // }, [state, useMiniBag])

  useEffect(() => {
    setLocationOrigin(window.location.origin)
  }, [])

  return (
    <header>
      <Row>
        <Col xs={4} sm={3} className='header-hamburger text-left'>
          <Button
            className={`hamburger hamburger--collapse ${
              stateMobileMenu ? 'is-active' : ''
            }`}
            variant='link'
            aria-label='Menu'
            onClick={() => dispatch()}
          >
            <span className='hamburger-box'>
              <span className='hamburger-inner' />
            </span>
          </Button>
        </Col>
        <Col xs={4} sm={6} md={8} className='header-logo'>
          <Link
            to={t('constant:slug.static.index.slug', { locale: i18n.language })}
          >
            <Img
              fluid={
                data[`logoLarge${i18n.language.toUpperCase()}`].childImageSharp
                  .fluid
              }
              className='logo-large'
            />
            <Img
              fixed={
                data[`logoSmall${i18n.language.toUpperCase()}`].childImageSharp
                  .fixed
              }
              className='logo-small'
            />
          </Link>
        </Col>
        <Col xs={4} sm={3} md={4}>
          <Row className='justify-content-end h-100'>
            <Col xs={5} sm={4} md={6} className='language-switcher'>
              {alternateLinks &&
                alternateLinks.map(
                  link =>
                    link.locale !== i18n.language && (
                      <Link
                        to={link.path}
                        hrefLang={link.locale}
                        key={link.locale}
                      >
                        <FontAwesomeIcon
                          icon={faGlobeEurope}
                          size='sm'
                          fixedWidth
                        />
                        <span className='long small-block'>
                          {' ' +
                            t(
                              `constant:header.language-switcher.long.${link.locale}`
                            )}
                        </span>
                        <span className='short small-block'>
                          {' ' +
                            t(
                              `constant:header.language-switcher.short.${link.locale}`
                            )}
                        </span>
                      </Link>
                    )
                )}
            </Col>
            <Col xs={5} sm={4} md={3} className='bag-link'>
              <Link
                to={t('constant:slug.static.bag.slug', {
                  locale: i18n.language
                })}
              >
                <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
                <span className='small-block'>{` (${sumBy(
                  bagObjects,
                  d => d.amount
                )})`}</span>
              </Link>
            </Col>
            <Col md={8} className='search-box align-self-end'>
              <Form
                action={`${locationOrigin}${t(
                  'constant:slug.static.search.slug',
                  {
                    locale: i18n.language
                  }
                )}`}
              >
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <Button variant='link' type='submit'>
                        <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
                      </Button>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control name='query' placeholder='Search' />
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
      <CSSTransition
        in={miniBag}
        onEnter={() => {
          setTimeout(() => {
            setMiniBag(false)
          }, 3000)
        }}
        timeout={350}
        className='mini-bag'
        classNames='mini-bag'
      >
        <div>{t('constant:header.mini-bag')}</div>
      </CSSTransition>
      <Navigation />
    </header>
  )
}

Header.propTypes = {
  useMiniBag: PropTypes.bool
}

export default Header
