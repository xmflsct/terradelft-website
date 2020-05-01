import React, { useReducer } from "react"
import { Container } from "react-bootstrap"
import { config } from "@fortawesome/fontawesome-svg-core"

import SEO from "./seo"
import Header from "./header"
import Footer from "./footer"

function reducer(stateMobileMenu) {
  return !stateMobileMenu
}
const initContextMobileMenu = false
export const ContextMobileMenu = React.createContext(initContextMobileMenu)

const Layout = ({ children, SEOtitle, SEOkeywords, containerName }) => {
  const [stateMobileMenu, dispatch] = useReducer(reducer, initContextMobileMenu)
  if (typeof window !== "undefined") {
    document.body.style.overflow = stateMobileMenu ? "hidden" : "scroll"
  }
  config.autoAddCss = false

  return (
    <Container
      className={`site-wrapper ${stateMobileMenu ? "mobile-menu-open" : ""}`}
      scroll={!stateMobileMenu}
    >
      <SEO title={SEOtitle} keywords={SEOkeywords} />
      <ContextMobileMenu.Provider value={{ stateMobileMenu, dispatch }}>
        <Header />
      </ContextMobileMenu.Provider>
      <main className={containerName}>{children}</main>
      <Footer />
    </Container>
  )
}

export default Layout
