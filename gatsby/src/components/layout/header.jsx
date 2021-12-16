import {
  faGlobeEurope,
  faSearch,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useStaticQuery, graphql } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import { Link, useI18next } from 'gatsby-plugin-react-i18next'
import { sumBy } from 'lodash'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { ContextMobileMenu } from '.'
import Navigation from './navigation'
import { bagReset, getBag, getBuildTime } from '../../state/slices/bag'
import '@fortawesome/fontawesome-svg-core/styles.css'

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      siteBuildMetadata {
        buildTime
      }
    }
  `)
  const { languages, originalPath, t, i18n } = useI18next()
  const { stateMobileMenu, dispatch } = useContext(ContextMobileMenu)
  const [miniBag, setMiniBag] = useState(false)
  const [locationOrigin, setLocationOrigin] = useState()

  const bagObjects = useSelector(getBag)
  const bagSum = useMemo(() => {
    return sumBy(bagObjects, d => d.amount)
  }, [bagObjects])
  const prevBagLength = useRef(bagObjects.length)
  useEffect(() => {
    if (bagObjects.length > prevBagLength.current) {
      setMiniBag(true)
      prevBagLength.current = bagObjects.length
    }
  }, [bagObjects.length, prevBagLength])

  useEffect(() => {
    setLocationOrigin(window.location.origin)
  }, [])

  const dispatchBag = useDispatch()
  const prevBuildTime = useSelector(getBuildTime)
  useEffect(() => {
    if (new Date(data.siteBuildMetadata.buildTime).getTime() > prevBuildTime) {
      dispatchBag(
        bagReset(new Date(data.siteBuildMetadata.buildTime).getTime())
      )
    }
  }, [data.siteBuildMetadata.buildTime, prevBuildTime, dispatchBag])

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
          <Link to='/'>
            {i18n.language === 'nl' && (
              <>
                <StaticImage
                  alt='logo'
                  src={`../../images/layout-header/logo-large-nl.png`}
                  placeholder='none'
                  className='logo-large'
                />
                <StaticImage
                  alt='logo'
                  src={`../../images/layout-header/logo-small-nl.png`}
                  placeholder='none'
                  className='logo-small'
                />
              </>
            )}
            {i18n.language === 'en' && (
              <>
                <StaticImage
                  alt='logo'
                  src={`../../images/layout-header/logo-large-en.png`}
                  placeholder='none'
                  className='logo-large'
                />
                <StaticImage
                  alt='logo'
                  src={`../../images/layout-header/logo-small-en.png`}
                  placeholder='none'
                  className='logo-small'
                />
              </>
            )}
          </Link>
        </Col>
        <Col xs={4} sm={3} md={4}>
          <Row className='justify-content-end h-100'>
            <Col xs={5} sm={4} md={6} className='language-switcher'>
              {languages.map(
                lng =>
                  lng !== i18n.language && (
                    <Link key={lng} to={originalPath} language={lng}>
                      <FontAwesomeIcon
                        icon={faGlobeEurope}
                        size='sm'
                        fixedWidth
                      />
                      <span className='long small-block'>
                        {' ' +
                          t(`translation:header.language-switcher.long.${lng}`)}
                      </span>
                      <span className='short small-block'>
                        {' ' +
                          t(
                            `translation:header.language-switcher.short.${lng}`
                          )}
                      </span>
                    </Link>
                  )
              )}
            </Col>
            <Col xs={5} sm={4} md={3} className='bag-link'>
              <Link to='/bag'>
                <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
                <span className='small-block'>{` (${bagSum})`}</span>
              </Link>
            </Col>
            <Col md={8} className='search-box align-self-end'>
              <Form
                action={`${locationOrigin}${t(
                  'translation:slug.static.search.slug',
                  {
                    locale: i18n.language
                  }
                )}`}
              >
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      background: 'none',
                      border: 'none',
                      borderRadius: 0,
                      borderBottom: '#394c50 1px solid'
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
                  </InputGroup.Text>
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
        <div>{t('translation:header.mini-bag')}</div>
      </CSSTransition>
      <Navigation />
    </header>
  )
}

export default Header
