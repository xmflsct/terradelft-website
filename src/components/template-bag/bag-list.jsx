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

const BagList = () => {
  const { state, dispatch } = useContext(ContextBag)
  const { t, i18n } = useTranslation([
    "static-bag",
    "component-object",
    "constant",
  ])

  return (
    <>
      {state.bag.objects.length !== 0 ? (
        state.bag.objects.map((_, i) => {
          const object = state.bag.objects[i]
          return (
            <Row key={i} className='list-object mb-3'>
              <Col xs={4} className='object-image'>
                <Img fluid={object.image.fluid} />
              </Col>
              <Col xs={8} className='object-details'>
                <Link
                  to={t("constant:slug.dynamic.object.slug", {
                    locale: i18n.language,
                    artist: object.artist,
                    object: object.name[i18n.language],
                    id: object.contentful_id_url,
                  })}
                  className='object-name'
                >
                  {object.name[i18n.language]}
                </Link>
                <Row className='object-details'>
                  <Col xs={5} sm={3} className='detail-type'>
                    {t("component-object:artist")}
                  </Col>
                  <Col xs={5} sm={9} className='detail-value'>
                    <Link
                      to={t("constant:slug.dynamic.artist.slug", {
                        locale: i18n.language,
                        artist: object.artist,
                      })}
                    >
                      {object.artist}
                    </Link>
                  </Col>
                </Row>
                {!isEmpty(object.variant) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={3} className='detail-type'>
                      {t("component-object:variant")}
                    </Col>
                    <Col xs={5} sm={9} className='detail-value'>
                      {object.variant[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.colour) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={3} className='detail-type'>
                      {t("component-object:colour")}
                    </Col>
                    <Col xs={5} sm={9} className='detail-value'>
                      {object.colour[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.size) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={3} className='detail-type'>
                      {t("component-object:size")}
                    </Col>
                    <Col xs={5} sm={9} className='detail-value'>
                      {object.size[i18n.language]}
                    </Col>
                  </Row>
                )}
                {Price(i18n.language, object.priceSale, object.priceOriginal)}
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
        <Row>
          <Col>
            <p>{t("static-bag:content.list.empty")}</p>
          </Col>
        </Row>
      )}
    </>
  )
}

export default BagList
