import React, { useContext } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { Link } from 'gatsby'
import Img from 'gatsby-image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { isEmpty } from 'lodash'

import { ContextBag } from '../../layouts/contexts/bag'
import { Price } from '../utils/price'
import * as formatNumber from '../utils/format-number'

const BagList = () => {
  const { state, dispatch } = useContext(ContextBag)
  const { t, i18n } = useTranslation([
    'static-bag',
    'component-object',
    'constant'
  ])

  return (
    <>
      {state.bag.objects.length !== 0 ? (
        state.bag.objects.map((_, i) => {
          const object = state.bag.objects[i]
          return (
            <Row key={i} className='list-object mb-3'>
              <Col xs={12} sm={5} className='object-image'>
                <Img fluid={object.image.fluid} backgroundColor='#e8e8e8' />
              </Col>
              <Col xs={12} sm={7} className='object-details'>
                <Link
                  to={t('constant:slug.dynamic.object.slug', {
                    locale: i18n.language,
                    artist: object.artist,
                    object: object.name[i18n.language],
                    id: object.contentful_id_url
                  })}
                  className='object-name'
                >
                  {object.name[i18n.language]}
                </Link>
                <Row className='object-details'>
                  <Col xs={5} sm={4} className='detail-type'>
                    {t('component-object:artist')}
                  </Col>
                  <Col xs={7} sm={8} className='detail-value'>
                    <Link
                      to={t('constant:slug.dynamic.artist.slug', {
                        locale: i18n.language,
                        artist: object.artist
                      })}
                    >
                      {object.artist}
                    </Link>
                  </Col>
                </Row>
                {!isEmpty(object.variant) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={4} className='detail-type'>
                      {t('component-object:variant')}
                    </Col>
                    <Col xs={7} sm={8} className='detail-value'>
                      {object.variant[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.colour) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={4} className='detail-type'>
                      {t('component-object:colour')}
                    </Col>
                    <Col xs={7} sm={8} className='detail-value'>
                      {object.colour[i18n.language]}
                    </Col>
                  </Row>
                )}
                {!isEmpty(object.size) && (
                  <Row className='object-details'>
                    <Col xs={5} sm={4} className='detail-type'>
                      {t('component-object:size')}
                    </Col>
                    <Col xs={7} sm={8} className='detail-value'>
                      {object.size[i18n.language]}
                    </Col>
                  </Row>
                )}
                <Row className='object-details'>
                  <Col xs={5} sm={4} className='detail-type'>
                    {t('component-object:price')}
                  </Col>
                  <Col xs={7} sm={8} className='detail-value'>
                    {formatNumber.currency(
                      object.priceSale || object.priceOriginal,
                      i18n.language
                    )}
                  </Col>
                </Row>
                <Row className='object-details'>
                  <Col xs={5} sm={4} className='detail-type'>
                    {t('component-object:amount')}
                  </Col>
                  <Col xs={7} sm={8} className='detail-value'>
                    <ReactSelect
                      options={Array(object.stock === 1 ? 1 : 99)
                        .fill()
                        .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                      defaultValue={{
                        value: object.amount,
                        label: object.amount
                      }}
                      onChange={e => {
                        dispatch({
                          type: 'update',
                          data: (() => {
                            object.amount = e.value
                            return object
                          })()
                        })
                      }}
                      isSearchable={false}
                      styles={{
                        container: provided => ({
                          ...provided,
                          maxWidth: '5rem'
                        })
                      }}
                    />
                  </Col>
                </Row>
                {Price(
                  i18n.language,
                  object.priceSale * object.amount,
                  object.priceOriginal * object.amount
                )}
                <Button
                  variant='link'
                  onClick={() => {
                    dispatch({
                      type: 'remove',
                      data: {
                        contentful_id: object.contentful_id
                      }
                    })
                  }}
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
            <p>{t('static-bag:content.list.empty')}</p>
          </Col>
        </Row>
      )}
    </>
  )
}

export default BagList
