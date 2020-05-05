import React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import { Col, Dropdown, Row } from "react-bootstrap"

const activeChildren = (location, children) => {
  if (location.pathname.includes(children)) {
    return { className: "active-children" }
  }
}

const Navigation = () => {
  const { t, i18n } = useTranslation(["constant"])

  return (
    <Row as='nav'>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.1.slug", { locale: i18n.language })}
          getProps={({ location }) =>
            activeChildren(
              location,
              t("constant:navigation.1.children", { locale: i18n.language })
            )
          }
        >
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
          getProps={({ location }) =>
            activeChildren(
              location,
              t("constant:navigation.3.children", { locale: i18n.language })
            )
          }
        >
          {t("constant:navigation.3.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.4.slug", { locale: i18n.language })}
          getProps={({ location }) =>
            activeChildren(
              location,
              t("constant:navigation.4.children", { locale: i18n.language })
            )
          }
        >
          {t("constant:navigation.4.name")}
        </Link>
      </Col>
      <Col xs={12} sm={4} md={2} className='nav-item'>
        <Link
          to={t("constant:navigation.5.slug", {
            locale: i18n.language,
          })}
          getProps={({ location }) =>
            activeChildren(
              location,
              t("constant:navigation.5.children", { locale: i18n.language })
            )
          }
        >
          {t("constant:navigation.5.name")}
        </Link>
      </Col>
      <Dropdown as={Col} xs={12} sm={4} md={2} role='menu' className='nav-item'>
        <Dropdown.Toggle as={Col}>
          {t("constant:navigation.6.name")}
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
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
          <Link
            to={t("constant:navigation.6.3.slug", {
              locale: i18n.language,
            })}
          >
            {t("constant:navigation.6.3.name")}
          </Link>
        </Dropdown.Menu>
      </Dropdown>
    </Row>
  )
}

export default Navigation
