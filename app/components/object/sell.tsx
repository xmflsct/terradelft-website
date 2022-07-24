import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import kunstkoop from '~/images/kunstkoop.png'
import { SelectedVariation } from '~/routes/$locale/object.$id'
import { ObjectsObject_NameLocalized } from '~/utils/contentful'
import ObjectPrice from './price'
import SellMain from './sellMain'
import SellVariations from './sellVariations'

type Props = {
  object: ObjectsObject_NameLocalized
  setSelectedVariation: Dispatch<SetStateAction<SelectedVariation | undefined>>
}

const ObjectSell: React.FC<Props> = ({ object, setSelectedVariation }) => {
  const { t } = useTranslation('object')

  if (object.variationsCollection?.items.length) {
    if (
      object.variationsCollection.items.filter(
        variation =>
          (variation.priceSale ?? 0 > 0) || variation.priceOriginal > 0
      ).length <= 0
    ) {
      return null
    }
  } else {
    if (!object.priceSale && !object.priceOriginal) {
      return null
    }
  }

  return (
    <div className='mb-2'>
      {object.variationsCollection?.items.length ? (
        <SellVariations
          object={object}
          setSelectedVariation={setSelectedVariation}
        />
      ) : object.stock ?? 0 > 0 ? (
        object.sellOnline ? (
          <SellMain object={object} />
        ) : (
          <ObjectPrice
            priceSale={object.priceSale}
            priceOriginal={object.priceOriginal}
          />
        )
      ) : object.stock === 0 ? (
        <div className='object-sold'>
          <span>{t('out-of-stock')}</span>
        </div>
      ) : null}
      {object.kunstKoop && (
        <div className='inline-block'>
          <a
            href='https://kunstkoop.nl/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={kunstkoop} width={60} height={60} />
          </a>
        </div>
      )}
    </div>
  )
}

export default ObjectSell
