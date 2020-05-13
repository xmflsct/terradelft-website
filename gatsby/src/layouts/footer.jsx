import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"

const Footer = () => {
  const { t } = useTranslation("constant")

  return (
    <Row as='footer'>
      <Col sm={4} className='footer-left'>
        <p>
          {t("footer.left.copyright")}
          <br />
          {t("footer.left.opening.1")}
          <br />
          {t("footer.left.opening.2")}
          <br />
          {t("footer.left.opening.3")}
        </p>
      </Col>
      <Col sm={4} className='footer-center'>
        <p>
          {t("footer.center.address")}
          <br />
          {t("footer.center.phone")}
          <br />
          {t("footer.center.email")}
        </p>
      </Col>
      <Col sm={4} className='footer-right'>
        <p>
          Made with ♥ by{" "}
          <a
            target='_blank'
            href='https://xmflsct.com'
            rel='noopener noreferrer'
          >
            xmflsct.com
          </a>
        </p>
      </Col>
    </Row>
  )
}

export default Footer
