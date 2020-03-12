import React from "react"
import { Link } from "gatsby"
import { Col, Row } from "react-bootstrap"

import { useTranslation } from "react-i18next"

const Header = () => {
  const { t } = useTranslation("common")
  return (
    <Row as="nav">
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/">{t("nav.1")}</Link>
        </Col>
      </Col>
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/test">{t("nav.2")}</Link>
        </Col>
      </Col>
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/test">{t("nav.3")}</Link>
        </Col>
      </Col>
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/test">{t("nav.4")}</Link>
        </Col>
      </Col>
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/test">{t("nav.5")}</Link>
        </Col>
      </Col>
      <Col lg={2} className="nav-item">
        <Col>
          <Link to="/test">{t("nav.6")}</Link>
        </Col>
      </Col>
    </Row>
  )
}

export default Header
