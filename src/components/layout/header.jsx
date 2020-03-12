import React from "react"
import Img from "gatsby-image"
import { useStaticQuery, graphql, Link } from "gatsby"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"

const Header = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      logoLargeEn: file(
        relativePath: { regex: "/(header/logo-large.en.png)/" }
      ) {
        childImageSharp {
          fluid(maxWidth: 700) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `)
  function changeLocale(locale) {
    if (
      location.pathname.substring(0, 3) === "/nl" ||
      location.pathname.substring(0, 3) === "/en"
    ) {
      if (location.pathname.substring(1, 3) != locale) {
        return "/" + locale + location.pathname.substring(3)
      } else {
        return "/" + locale + location.pathname
      }
    } else {
      return "/" + locale + location.pathname
    }
  }
  const { i18n } = useTranslation()
  const changeLanguage = lng => {
    i18n.changeLanguage(lng)
  }
  if (i18n.language.substring(0, 2) != location.pathname.substring(1, 3)) {
    console.log("no")
    i18n.changeLanguage(location.pathname.substring(1, 3))
  }

  return (
    <Row as="header">
      <Col lg={9} md={12} className="header-left">
        <Link to={location.pathname.substring(0, 4)}>
          <Img fluid={data.logoLargeEn.childImageSharp.fluid} />
        </Link>
      </Col>
      <Col lg={3} className="header-right">
        <Row className="language-switcher">
          <Col>
            <Link to={changeLocale("nl")}>
              <Button
                variant="link"
                className={
                  i18n.language.substring(0, 2) === "nl" ? "active" : "inactive"
                }
                onClick={() => changeLanguage("nl")}
              >
                Nederlands
              </Button>
            </Link>
          </Col>
          <Col>
            <Link to={changeLocale("en")}>
              <Button
                variant="link"
                className={
                  i18n.language.substring(0, 2) === "en" ? "active" : "inactive"
                }
                onClick={() => changeLanguage("en")}
              >
                English
              </Button>
            </Link>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Header
