import { dimension } from '@utils/formatNumber'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const ObjectAttribute = ({ type, value }) => {
  const { t, i18n } = useTranslation('constant')
  return (
    <Row className='object-attribute'>
      <Col xs={4} sm={3} className='attribute-type'>
        {type}
      </Col>
      {!Array.isArray(value) ? (
        <Col xs={8} sm={9} className='attribute-value'>
          {typeof value === 'object'
            ? // Year only
              value[Object.keys(value)[0]]
            : // Dimensions only
              dimension(value, i18n.language)}
        </Col>
      ) : (
        // Technique and material, many references
        <Col xs={8} sm={9} className='attribute-value'>
          {value.map((d, i) => (
            <span key={i}>
              <Link
                to={t('translation:slug.dynamic.objects-attribute.slug', {
                  locale: i18n.language,
                  type: type,
                  value: Object.values(d)[0]
                })}
              >
                {Object.values(d)[0]}
              </Link>
              {i !== value.length - 1 && ', '}
            </span>
          ))}
        </Col>
      )}
    </Row>
  )
}

export default ObjectAttribute
