import React, { useContext } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"
import Img from "gatsby-image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { isEmpty } from "lodash"

import { ContextBag } from "../../layouts/contexts/bag"
import { Price } from "../utils/price"

const slugify = require("slugify")

const BagList = () => {
  const { state, dispatch } = useContext(ContextBag)
  const { t, i18n } = useTranslation("component-object")

  return (
    <>
      {state.bag.objects.length !== 0 ? (
        state.bag.objects.map((_, i) => {
          const object = state.bag.objects[i]
          return (
            <Row key={i} className='list-object mb-3'>
              <Col lg={4} className='object-image'>
                <Img fluid={object.image.fluid} />
              </Col>
              <Col lg={8} className='object-details'>
                <Link
                  to={`/${i18n.language}/${slugify(object.artist, {
                    lower: true,
                  })}/${slugify(
                    `${object.name[i18n.language]}-${object.contentful_id_url}`,
                    { lower: true }
                  )}`}
                  className='object-name'
                >
                  {object.name[i18n.language]}
                </Link>
                {!isEmpty(object.variant) && (
                  <Row className='object-variations'>
                    <Col xs={3} className='variations-type'>
                      {t("variant")}
                    </Col>
                    <Col xs={9} className='variations-value'>
                      {object.variant[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.colour) && (
                  <Row className='object-variations'>
                    <Col xs={3} className='variations-type'>
                      {t("colour")}
                    </Col>
                    <Col xs={9} className='variations-value'>
                      {object.colour[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.size) && (
                  <Row className='object-variations'>
                    <Col xs={3} className='variations-type'>
                      {t("size")}
                    </Col>
                    <Col xs={9} className='variations-value'>
                      {object.size[i18n.language]}
                    </Col>
                  </Row>
                )}
                {Price(object.priceSale, object.priceOriginal)}
                <Button
                  variant='link'
                  onClick={() =>
                    dispatch({
                      type: "remove",
                      data: {
                        contentful_id: object.contentful_id,
                      },
                    })
                  }
                  className='object-remove'
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </Col>
            </Row>
          )
        })
      ) : (
        <Row>Empty</Row>
      )}
    </>
  )
}

export default BagList
