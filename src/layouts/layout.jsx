import React from "react"
import { Button, Container } from "react-bootstrap"
import { config } from '@fortawesome/fontawesome-svg-core'

import SEO from "./seo"
import Header from "./header"
import Navigation from "./navigation"
import Footer from "./footer"

const Layout = ({ children, SEOtitle, SEOkeywords, containerName }) => {
  const [toggleNav, setToggleNav] = React.useState(false)
  config.autoAddCss = false

  return (
    <Container className={`site-wrapper ${toggleNav ? "site-head-open" : ""}`}>
      <SEO title={SEOtitle} keywords={SEOkeywords} />
      {/* <Button
        className={`nav-burger hamburger hamburger--collapse ${
          toggleNav ? "is-active" : ""
        }`}
        variant='link'
        onClick={() => setToggleNav(!toggleNav)}
      >
        <span className='hamburger-box'>
          <span className='hamburger-inner'></span>
        </span>
      </Button> */}

        <Header />
        <Navigation />
        <Container as='main' className={containerName}>{children}</Container>

      <Footer />
    </Container>
  )
}

export default Layout
