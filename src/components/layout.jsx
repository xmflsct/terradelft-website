import React, { useReducer } from "react"
import { Button, Container } from "react-bootstrap"

import "../styles/main.scss"
import SEO from "./layout/seo"
import Header from "./layout/header"
import Nav from "./layout/nav"
import Footer from "./layout/footer"

import { storageAdd, storageRemove, storageCheck } from "./localStorage"

export const BagObjects = React.createContext([])
const initBagObjects = storageCheck()
function reducer(_, action) {
  switch (action.type) {
    case "add":
      console.log("add received!")
      return storageAdd(action.data)
    case "remove":
      console.log("remove received!")
      return storageRemove(action.data)
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
