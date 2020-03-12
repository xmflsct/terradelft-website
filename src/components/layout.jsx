import React from "react"

import "../styles/main.scss"

import SEO from "./layout/seo"
import Header from "./layout/header"
import Nav from "./layout/nav"
import Footer from "./layout/footer"
import { Button, Container, Row } from "react-bootstrap"

const Layout = props => {
  const [toggleNav, setToggleNav] = React.useState(false)

  const { children, location, name, SEOtitle, SEOkeywords } = props

  return (
    <Container
      className={`site-wrapper ${name} ${toggleNav ? "site-head-open" : ""}`}
    >
      <SEO title={SEOtitle} keywords={SEOkeywords} />
      <Button
        className={`nav-burger hamburger hamburger--collapse ${
          toggleNav ? "is-active" : ""
        }`}
        variant="link"
        onClick={() => setToggleNav(!toggleNav)}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </Button>

      <Header location={location} />
      <Nav />

      <Container as="main">{children}</Container>

      <Footer />
    </Container>
  )
}

export default Layout
