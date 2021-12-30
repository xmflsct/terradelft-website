import { config } from '@fortawesome/fontawesome-svg-core'
import React, { useReducer } from 'react'
import { Container } from 'react-bootstrap'
import Announcement from './announcement'
import Footer from './footer'
import Header from './header'
import Seo from './seo'

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
  containerName
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
        <Header />
      </ContextMobileMenu.Provider>
      <Announcement />
      <main className={containerName}>{children}</main>
      <Footer />
    </Container>
  )
}

export default Layout
