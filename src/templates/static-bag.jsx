import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"

import Layout from "../layouts/layout"
import BagList from "../components/template-bag/bag-list"
import BagCheckout from "../components/template-bag/bag-checkout"

const Bag = () => {
  const { t } = useTranslation("static-bag")

  return (
    <Layout
      SEOtitle='Terra Delft'
      SEOkeywords={["Terra", "Delft", "Terra Delft"]}
    >
      <h1>{t("h1")}</h1>
      <Row>
        <Col lg={8}>
          <BagList />
        </Col>
        <Col lg={4}>
          <BagCheckout />
        </Col>
      </Row>
    </Layout>
  )
}

export default Bag
