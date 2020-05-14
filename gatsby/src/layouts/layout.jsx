import PropTypes from 'prop-types'
import React, { useReducer } from 'react'
import { Container } from 'react-bootstrap'
import { config } from '@fortawesome/fontawesome-svg-core'

import Seo from './seo'
import Header from './header'
import Footer from './footer'

function reducer (stateMobileMenu) {
  return !stateMobileMenu
}
const initContextMobileMenu = false
export const ContextMobileMenu = React.createContext(initContextMobileMenu)

const Layout = ({
  children,
  SEOtitle,
  SEOkeywords,
  containerName,
  useMiniBag
}) => {
  const [stateMobileMenu, dispatch] = useReducer(reducer, initContextMobileMenu)
  if (typeof window !== 'undefined') {
    document.body.style.overflow = stateMobileMenu ? 'hidden' : 'scroll'
  }
  config.autoAddCss = false

  return (
    <Container
      className={`site-wrapper ${stateMobileMenu ? 'mobile-menu-open' : ''}`}
      scroll={(!stateMobileMenu).toString()}
    >
      <Seo title={SEOtitle} keywords={SEOkeywords} />
      <ContextMobileMenu.Provider value={{ stateMobileMenu, dispatch }}>
        <Header useMiniBag={useMiniBag} />
      </ContextMobileMenu.Provider>
      <main className={containerName}>{children}</main>
      <Footer />
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.elementType.isRequired,
  SEOtitle: PropTypes.string.isRequired,
  SEOkeywords: PropTypes.string.isRequired,
  containerName: PropTypes.string.isRequired,
  useMiniBag: PropTypes.bool.isRequired
}

export default Layout
