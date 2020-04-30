import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import { Col, Row } from "react-bootstrap"

const Header = () => {
  const { t, i18n } = useTranslation(["constant"])

  return (
    <Row as='nav'>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.index.slug", { locale: i18n.language })}
        >
          {t("constant:navigation.1.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.online-shop.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.2.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.events.slug", { locale: i18n.language })}
        >
          {t("constant:navigation.3.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.news.slug", { locale: i18n.language })}
        >
          {t("constant:navigation.4.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.terra-in-china.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.5.name")}
        </Link>
      </Col>
      <Col lg={2} className='nav-item'>
        <Link
          to={t("constant:slug.static.about-terra.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.6.name")}
        </Link>
      </Col>
    </Row>
  )
}

export default Header
