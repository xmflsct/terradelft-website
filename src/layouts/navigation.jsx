import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import { Col, Row } from "react-bootstrap"

const Header = () => {
  const { t, i18n } = useTranslation(["constant"])

  return (
    <Row as='nav'>
      <Col lg={2} className='nav-item'>
        <Link to={"/" + i18n.language}>{t("constant:navigation.1.name")}</Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link to={"/" + i18n.language + "/" + t("constant:navigation.2.url")}>
          {t("constant:navigation.2.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link to='/test'>{t("constant:navigation.3.name")}</Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link to='/test'>{t("constant:navigation.4.name")}</Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link to='/test'>{t("constant:navigation.5.name")}</Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link to='/test'>{t("constant:navigation.6.name")}</Link>
      </Col>
    </Row>
  )
}

export default Header
