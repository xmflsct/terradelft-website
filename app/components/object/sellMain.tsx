import { useContext, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { BagContext } from '~/states/bag'
import { ObjectsObject_NameLocalized } from '~/utils/contentful'
import Button from '../button'
import FormField from '../formField'
import Price from './price'
import { selectStyle } from './sell'

type Props = {
  object: ObjectsObject_NameLocalized
}

const SellMain: React.FC<Props> = ({ object }) => {
  const { t } = useTranslation('object')

  const { objectsAdd } = useContext(BagContext)

  const [amount, setAmount] = useState(1)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        objectsAdd({
          amount,
          type: 'main',
          contentful_id: object.sys.id,
          contentful_id_url: object.sys.id,
          artist: object.artist,
          image: object.imagesCollection?.items[0],
          priceOriginal: object.priceOriginal!,
          priceSale: object.priceSale,
          stock: object.stock || 1,
          sku: object.sku,
          // Locale dependent
          name: object.name
        })
      }}
      className='my-4'
    >
      <FormField label={t('amount')}>
        <ReactSelect
          instanceId={useId()}
          name='bagAdd'
          options={Array(object.stock === 1 ? 1 : 50)
            .fill(undefined)
            .map((_, i) => ({ value: i + 1, label: i + 1 }))}
          defaultValue={{ value: 1, label: 1 }}
          isSearchable={false}
          onChange={e => e && setAmount(e.value)}
          styles={selectStyle}
        />
      </FormField>
      <Price
        priceSale={(object.priceSale || 0) * amount}
        priceOriginal={(object.priceOriginal || 0) * amount}
      />
      <Button type='submit'>{t('add-to-bag')}</Button>
    </form>
  )
}

export default SellMain
