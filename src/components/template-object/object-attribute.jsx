import React from "react"
import { Col, Row } from "react-bootstrap"
import { useTranslation } from "react-i18next"
import { Link } from "gatsby"

import * as formatNumber from "../utils/formatNumber"

const ObjectAttribute = ({ type, value }) => {
  const { t, i18n } = useTranslation("constant")
  return (
    <Row className='object-attribute'>
      <Col xs={4} sm={3} className='attribute-type'>
        {type}
      </Col>
      {!Array.isArray(value) ? (
        <Col xs={8} sm={9} className='attribute-value'>
          {typeof value === "object"
            ? // Year only
              value[Object.keys(value)[0]]
            : // Dimensions only
              formatNumber.dimension(value, i18n.language)}
        </Col>
      ) : (
        // Technique and material, many references
        <Col xs={8} sm={9} className='attribute-value'>
          {value.map((d, i) => (
            <span key={i}>
              <Link
                to={t("constant:slug.dynamic.objects-attribute.slug", {
                  locale: i18n.language,
                  type: type,
                  value: Object.values(d)[0],
                })}
              >
                {Object.values(d)[0]}
              </Link>
              {i !== value.length - 1 && ", "}
            </span>
          ))}
        </Col>
      )}
    </Row>
  )
}

export default ObjectAttribute
