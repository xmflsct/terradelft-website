import { useTranslation } from 'react-i18next'
import { currency } from '~/utils/formatNumber'

type Props = {
  subtotal: number
  discount: number
}

const CheckoutAmounts: React.FC<Props> = ({ subtotal, discount }) => {
  const { t, i18n } = useTranslation('pageBag')

  return (
    <>
      <input type='hidden' name='subtotal' value={subtotal} />
      <input type='hidden' name='discount' value={discount} />

      <table className='table-auto my-2'>
        <tbody>
          <tr>
            <th className='text-left py-1 pr-8'>
              {t('content.checkout.summary.subtotal')}
            </th>
            <td>{currency(subtotal, i18n.language)}</td>
          </tr>
          {discount && discount > 0 ? (
            <tr>
              <th className='text-left py-1 pr-8'>
                {t('content.checkout.summary.discount')}
              </th>
              <td>- {currency(discount, i18n.language)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </>
  )
}

export default CheckoutAmounts
