import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSObjectWithLabel } from 'react-select'
import kunstkoop from '~/images/kunstkoop.png'
import { SelectedImages, SelectedVariation } from '~/routes/$locale/object.$id'
import {
  ObjectsObjectVariation_NameLocalized,
  ObjectsObject_NameLocalized
} from '~/utils/contentful'
import ObjectPrice from './price'
import SellMain from './sellMain'
import SellVariations from './sellVariations'

type Props = {
  object: Omit<ObjectsObject_NameLocalized, 'variationsCollection'> & {
    variationsCollection: { items: ObjectsObjectVariation_NameLocalized[] }
  }
  setSelectedImages: Dispatch<SetStateAction<SelectedImages>>
  setSelectedVariation: Dispatch<SetStateAction<SelectedVariation>>
}

export const selectStyle = {
  container: (provided: CSSObjectWithLabel) => ({ ...provided, flexGrow: 1 }),
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    borderColor: '#e7e5e4',
    borderTopLeftRadius: '0px',
    borderBottomLeftRadius: '0px',
    height: '100%'
  })
}

const ObjectSell: React.FC<Props> = ({ object, setSelectedImages, setSelectedVariation }) => {
  const { t } = useTranslation('object')

  if (object.variationsCollection?.items.length) {
    if (
      object.variationsCollection.items.filter(
        variation => (variation.priceSale ?? 0 > 0) || variation.priceOriginal > 0
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
          setSelectedImages={setSelectedImages}
          setSelectedVariation={setSelectedVariation}
        />
      ) : object.stock ?? 0 > 0 ? (
        object.sellOnline ? (
          <SellMain object={object} />
        ) : (
          <ObjectPrice priceSale={object.priceSale} priceOriginal={object.priceOriginal} />
        )
      ) : object.stock === 0 ? (
        <div className='object-sold'>
          <span>{t('out-of-stock')}</span>
        </div>
      ) : null}
      {object.kunstKoop && (
        <div className='inline-block'>
          <a href='https://kunstkoop.nl/' target='_blank' rel='noopener noreferrer'>
            <img src={kunstkoop} width={60} height={60} />
          </a>
        </div>
      )}
    </div>
  )
}

export default ObjectSell
