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
  SEOdescription,
  SEOschema,
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
      <Seo
        title={SEOtitle}
        keywords={SEOkeywords}
        description={SEOdescription}
        schema={SEOschema}
      />
      <ContextMobileMenu.Provider value={{ stateMobileMenu, dispatch }}>
        <Header useMiniBag={useMiniBag} />
      </ContextMobileMenu.Provider>
      <main className={containerName}>{children}</main>
      <Footer />
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  SEOtitle: PropTypes.string.isRequired,
  SEOkeywords: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  SEOdescription: PropTypes.string.isRequired,
  SEOschema: PropTypes.object,
  containerName: PropTypes.string.isRequired,
  useMiniBag: PropTypes.bool
}

export default Layout
