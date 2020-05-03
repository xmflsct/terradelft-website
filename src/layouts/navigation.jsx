import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import { Col, Row } from "react-bootstrap"

const Header = () => {
  const { t, i18n } = useTranslation(["constant"])

  return (
    <Row as='nav'>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link to={t("constant:navigation.1.slug", { locale: i18n.language })}>
          {t("constant:navigation.1.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.2.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.2.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.3.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.3.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link to={t("constant:navigation.4.slug", { locale: i18n.language })}>
          {t("constant:navigation.4.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.5.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.5.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.6.slug", {
            locale: i18n.language,
          })}
        >
          {t("constant:navigation.6.name")}
        </Link>
        <div className='sub-nav'>
          <Link
            to={t("constant:navigation.6.1.slug", {
              locale: i18n.language,
            })}
          >
            {t("constant:navigation.6.1.name")}
          </Link>
          <Link
            to={t("constant:navigation.6.2.slug", {
              locale: i18n.language,
            })}
          >
            {t("constant:navigation.6.2.name")}
          </Link>
        </div>
      </Col>
    </Row>
  )
}

export default Header
