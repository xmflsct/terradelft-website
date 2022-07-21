import { useTranslation } from 'react-i18next'
import { currency } from '~/utils/formatNumber'

type Props = {
  priceSale?: number
  priceOriginal?: number
  showZero?: boolean
}

const ObjectPrice: React.FC<Props> = ({
  priceSale,
  priceOriginal,
  showZero = false
}) => {
  const { i18n } = useTranslation()

  return (
    <>
      {!showZero &&
      !(priceSale ?? 0 > 0) &&
      !(priceOriginal ?? 0 > 0) ? null : (
        <div className='text-xl'>
          {priceSale ? (
            <p>
              <span className='text-secondary'>
                {currency(priceSale, i18n.language)}
              </span>
              {priceOriginal && (
                <span className='line-through'>
                  <s>{currency(priceOriginal, i18n.language)}</s>
                </span>
              )}
            </p>
          ) : (
            priceOriginal && (
              <p>
                <span>{currency(priceOriginal, i18n.language)}</span>
              </p>
            )
          )}
        </div>
      )}
    </>
  )
}

export default ObjectPrice
