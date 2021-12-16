import { currency } from '@utils/formatNumber'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface Props {
  subtotal: number
  discount: number
}

const CheckoutAmounts: React.FC<Props> = ({ subtotal, discount }) => {
  const { t, i18n } = useTranslation()

  return (
    <div style={{ marginBottom: '2em' }}>
      <Row className='checkout-sum sum-subtotal'>
        <Col md='5'>
          <strong>{t('content.checkout.summary.subtotal')}</strong>
        </Col>
        <Col md='7'>{currency(subtotal, i18n.language)}</Col>
      </Row>
      {discount && discount > 0 ? (
        <Row className='checkout-sum sum-discount'>
          <Col md='5'>
            <strong>{t('content.checkout.summary.discount')}</strong>
          </Col>
          <Col md='7'>- {currency(discount, i18n.language)}</Col>
        </Row>
      ) : null}
    </div>
  )
}

export default CheckoutAmounts
