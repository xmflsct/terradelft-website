import { currency } from '@utils/formatNumber'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface Props {
  subtotal: number
  discount?: number
  delivery?: number
}

const CheckoutAmounts: React.FC<Props> = ({ subtotal, discount, delivery }) => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <Row className='checkout-sum sum-subtotal'>
        <Col md='5'>
          <strong>{t('content.checkout.summary.subtotal')}</strong>
        </Col>
        <Col md='7'>{currency(subtotal, i18n.language)}</Col>
      </Row>
      {discount && discount > 0 && (
        <Row className='checkout-sum sum-discount'>
          <Col md='5'>
            <strong>{t('content.checkout.summary.discount')}</strong>
          </Col>
          <Col md='7'>- {currency(discount, i18n.language)}</Col>
        </Row>
      )}
      <Row className='checkout-sum sum-shipping mb-2'>
        <Col md='5'>
          <strong>{t('content.checkout.summary.delivery')}</strong>
        </Col>
        <Col md='7'>
          {delivery !== undefined &&
            (delivery === 0
              ? t('content.checkout.delivery.free')
              : currency(delivery, i18n.language))}
        </Col>
      </Row>
      <Row className='checkout-sum sum-total'>
        <Col md='5'>
          <strong>{t('content.checkout.summary.total')}</strong>
        </Col>
        <Col md='7'>
          {delivery !== undefined &&
            currency(
              (subtotal * 10 - (discount || 0) * 10 + delivery * 10) / 10,
              i18n.language
            )}
        </Col>
      </Row>
    </>
  )
}

export default CheckoutAmounts
