import React, { useReducer } from "react"
import { Button, Container } from "react-bootstrap"

import "../styles/main.scss"
import SEO from "./layout/seo"
import Header from "./layout/header"
import Nav from "./layout/nav"
import Footer from "./layout/footer"

import * as storage from "./storage"

export const BagObjects = React.createContext([])
const initBagObjects = storage.check()
function reducer(_, action) {
  switch (action.type) {
    case "add":
      return storage.add(action.data)
    case "remove":
      return storage.remove(action.data)
    default:
      throw new Error()
  }
}

const Layout = ({ children, SEOtitle, SEOkeywords }) => {
  const [toggleNav, setToggleNav] = React.useState(false)
  const [state, dispatch] = useReducer(reducer, initBagObjects)

  return (
    <Container className={`site-wrapper ${toggleNav ? "site-head-open" : ""}`}>
      <SEO title={SEOtitle} keywords={SEOkeywords} />
      <Button
        className={`nav-burger hamburger hamburger--collapse ${
          toggleNav ? "is-active" : ""
        }`}
        variant='link'
        onClick={() => setToggleNav(!toggleNav)}
      >
        <span className='hamburger-box'>
          <span className='hamburger-inner'></span>
        </span>
      </Button>

      <BagObjects.Provider value={{ state, dispatch }}>
        <Header />
        <Nav />
        <Container as='main'>{children}</Container>
      </BagObjects.Provider>

      <Footer />
    </Container>
  )
}

export default Layout
