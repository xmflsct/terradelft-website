import { useTranslation } from 'react-i18next'
import { currency } from '~/utils/formatNumber'

type Props = {
  priceSale?: number
  priceOriginal?: number
  showZero?: boolean
}

const ObjectPrice: React.FC<Props> = ({ priceSale, priceOriginal, showZero = false }) => {
  const { i18n } = useTranslation()

  return (
    <>
      {!showZero && !(priceSale ?? 0 > 0) && !(priceOriginal ?? 0 > 0) ? null : (
        <p className='text-xl'>
          {priceSale ? (
            <span>
              <span className='text-secondary'>{currency(priceSale, i18n.language)}</span>
              {priceOriginal && (
                <span className='line-through'>
                  <s>{currency(priceOriginal, i18n.language)}</s>
                </span>
              )}
            </span>
          ) : (
            priceOriginal && (
              <span>
                <span>{currency(priceOriginal, i18n.language)}</span>
              </span>
            )
          )}
        </p>
      )}
    </>
  )
}

export default ObjectPrice
