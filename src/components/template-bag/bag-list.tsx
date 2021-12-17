import { Price } from '@components/price'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { bagAdd, bagRemove, getBag } from '@state/slices/bag'
import { currency } from '@utils/formatNumber'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import { isEmpty } from 'lodash'
import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import ReactSelect from 'react-select'

const BagList = () => {
  const dispatch = useDispatch()
  const bagObjects = useSelector(getBag)
  const { t, i18n } = useTranslation()

  if (bagObjects.length === 0) {
    return (
      <Row>
        <Col>
          <p>{t('content.list.empty')}</p>
        </Col>
      </Row>
    )
  } else {
    return bagObjects.map(object => {
      return (
        <Row key={object.contentful_id} className='list-object mb-3'>
          <Col xs={12} sm={5} className='object-image'>
            <GatsbyImage
              image={object.image.gatsbyImageData}
              // @ts-ignore
              alt={object.name[i18n.language]}
            />
          </Col>
          <Col xs={12} sm={7} className='object-details'>
            <Link to={object.gatsbyPath} className='object-name'>
              {
                // @ts-ignore
                object.name[i18n.language]
              }
            </Link>
            {object.artist ? (
              <Row className='object-details'>
                <Col xs={5} sm={4} className='detail-type'>
                  {t('component-object:artist')}
                </Col>
                <Col xs={7} sm={8} className='detail-value'>
                  <Link to={object.artist.gatsbyPath}>
                    {object.artist.name}
                  </Link>
                </Col>
              </Row>
            ) : null}
            {!isEmpty(object.variant) && (
              <Row className='object-details'>
                <Col xs={5} sm={4} className='detail-type'>
                  {t('component-object:variant')}
                </Col>
                <Col xs={7} sm={8} className='detail-value'>
                  {
                    // @ts-ignore
                    object.variant[i18n.language]
                  }
                </Col>
              </Row>
            )}
            {!isEmpty(object.colour) && (
              <Row className='object-details'>
                <Col xs={5} sm={4} className='detail-type'>
                  {t('component-object:colour')}
                </Col>
                <Col xs={7} sm={8} className='detail-value'>
                  {
                    // @ts-ignore
                    object.colour[i18n.language]
                  }
                </Col>
              </Row>
            )}
            {!isEmpty(object.size) && (
              <Row className='object-details'>
                <Col xs={5} sm={4} className='detail-type'>
                  {t('component-object:size')}
                </Col>
                <Col xs={7} sm={8} className='detail-value'>
                  {
                    // @ts-ignore
                    object.size[i18n.language]
                  }
                </Col>
              </Row>
            )}
            <Row className='object-details'>
              <Col xs={5} sm={4} className='detail-type'>
                {t('component-object:price')}
              </Col>
              <Col xs={7} sm={8} className='detail-value'>
                {currency(
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
                  options={Array(object.stock === 1 ? 1 : 50)
                    .fill('')
                    .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                  defaultValue={{
                    value: object.amount,
                    label: object.amount
                  }}
                  onChange={e => {
                    e && dispatch(bagAdd({ ...object, amount: e.value }))
                  }}
                  isSearchable={false}
                  styles={{
                    container: provided => ({
                      ...provided,
                      maxWidth: '5rem'
                    })
                  }}
                  isDisabled={object.stock === 1}
                />
              </Col>
            </Row>
            <Price
              priceSale={(object.priceSale || 0) * object.amount}
              priceOriginal={object.priceOriginal * object.amount}
            />
            <Button
              variant='link'
              onClick={() => {
                dispatch(bagRemove({ contentful_id: object.contentful_id }))
              }}
              className='object-remove'
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Col>
        </Row>
      )
    })
  }
}

export default BagList
