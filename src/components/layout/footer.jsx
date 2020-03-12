import React from "react"
import { Col, Row } from "react-bootstrap"

const Footer = () => {
  return (
    <Row as="footer">
      <Col lg={4} className="footer-left">
        <p>
          © Terra Delft Online 2015 - 2020
          <br />
          Wednesday to Friday 11.00 - 18.00
          <br />
          Saturday 11.00 - 17.00
          <br />
          1st Sunday/month 13.00 - 17.00
        </p>
      </Col>
      <Col lg={4} className="footer-center">
        <p>
          Nieuwstraat 7, 2611 HK Delft
          <br />
          Tel/Fax: 015-2147072
          <br />
          Email: info@terra-delft.nl
        </p>
      </Col>
      <Col lg={4} className="footer-right">
        <p>
          Made with ♥ by{" "}
          <a target="_blank" href="https://xmflsct.com">
            xmflsct.com
          </a>
        </p>
      </Col>
    </Row>
  )
}

export default Footer
