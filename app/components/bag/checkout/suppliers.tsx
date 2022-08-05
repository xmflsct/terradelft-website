import {
  faApplePay,
  faCcAmex,
  faGoogleWallet,
  faCcMastercard,
  faCcVisa,
  faIdeal
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CheckoutSuppliers: React.FC = () => {
  return (
    <div className='flex flex-row justify-around'>
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
