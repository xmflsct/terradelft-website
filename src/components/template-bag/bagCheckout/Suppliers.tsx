import {
  faApplePay,
  faCcAmex,
  faGoogleWallet,
  faCcMastercard,
  faCcVisa,
  faIdeal
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const CheckoutSuppliers: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
    >
      <FontAwesomeIcon icon={faIdeal} size='2x' />{' '}
      <FontAwesomeIcon icon={faApplePay} size='2x' />{' '}
      <FontAwesomeIcon icon={faGoogleWallet} size='2x' />{' '}
      <FontAwesomeIcon icon={faCcVisa} size='2x' />{' '}
      <FontAwesomeIcon icon={faCcMastercard} size='2x' />{' '}
      <FontAwesomeIcon icon={faCcAmex} size='2x' />
    </div>
  )
}

export default CheckoutSuppliers
