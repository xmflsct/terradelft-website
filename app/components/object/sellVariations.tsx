import { difference, findIndex, intersection, max, min, union } from 'lodash'
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { SelectedVariation } from '~/routes/$locale/object.$id'
import { BagContext } from '~/states/bag'
import { ObjectsObject_NameLocalized } from '~/utils/contentful'
import { currency } from '~/utils/formatNumber'
import Button from '../button'
import FormField from '../formField'
import Price from './price'

type Props = {
  object: ObjectsObject_NameLocalized
  setSelectedVariation: Dispatch<SetStateAction<SelectedVariation | undefined>>
}

const SellVariations: React.FC<Props> = ({ object, setSelectedVariation }) => {
  if (!object.variationsCollection) {
    return null
  }

  const { objectsAdd } = useContext(BagContext)

  const { t, i18n } = useTranslation('object')

  const sellVariations = object.variationsCollection.items.filter(
    item => item.sellOnline && item.stock > 0
  )
  const allIDs = sellVariations.map(v => v.sys.id)

  const priceOriginal = {
    min: min(sellVariations.map(v => v.priceOriginal)),
    max: max(sellVariations.map(v => v.priceOriginal))
  }
  const priceSale = {
    min: min(sellVariations.map(v => v.priceSale)),
    max: max(sellVariations.map(v => v.priceSale))
  }

  const [optionsVariant, setOptionsVariant] = useState<Options>()
  const [optionsColour, setOptionsColour] = useState<Options>()
  const [optionsSize, setOptionsSize] = useState<Options>()
  const [selected, setSelected] = useState<{
    variant?: string[]
    colour?: string[]
    size?: string[]
  }>()
  const [amount, setAmount] = useState<number | undefined>(undefined)

  type Options = { value: string[]; label: string; isDisabled: boolean }[]

  useEffect(() => {
    const d: { variant: Options; colour: Options; size: Options } = {
      variant: [],
      colour: [],
      size: []
    }

    const variationsRange: string[] = []
    // Fill options from data source
    for (const variation of sellVariations) {
      variationsRange.push(variation.sys.id)
      for (const type of Object.keys(d)) {
        const typeKey = type as keyof typeof d
        if (variation[typeKey]) {
          const matchIndex = findIndex(d[typeKey], [
            'label',
            // @ts-ignore
            variation[typeKey][i18n.language]
          ])
          if (matchIndex === -1) {
            d[typeKey].push({
              // @ts-ignore
              label: variation[typeKey][i18n.language],
              value: [variation.sys.id],
              isDisabled: false
            })
          } else {
            d[typeKey][matchIndex].value.push(variation.sys.id)
          }
        }
      }
    }

    // Fill "empty" fields and option type, delete empty options
    for (const type of Object.keys(d)) {
      const typeKey = type as keyof typeof d
      const dValue = union(...d[typeKey].map(m => m.value))
      if (dValue.length === 0) {
        delete d[typeKey]
      } else if (dValue.length < sellVariations.length) {
        d[typeKey].push({
          label: t('option-default'),
          value: difference(variationsRange, dValue),
          isDisabled: false
        })
      }
    }

    setOptionsVariant(d.variant)
    setOptionsColour(d.colour)
    setOptionsSize(d.size)
  }, [])

  const commonIDs = intersection(
    selected?.variant || allIDs,
    selected?.colour || allIDs,
    selected?.size || allIDs
  )
  const variation =
    commonIDs.length === 1
      ? sellVariations[sellVariations.findIndex(v => v.sys.id === commonIDs[0])]
      : undefined

  useEffect(() => {
    optionsVariant &&
      setOptionsVariant(
        optionsVariant.map(variant => ({
          ...variant,
          isDisabled:
            intersection(
              variant.value,
              intersection(selected?.colour || allIDs, selected?.size || allIDs)
            ).length < 1
        }))
      )
    optionsColour &&
      setOptionsColour(
        optionsColour.map(colour => ({
          ...colour,
          isDisabled:
            intersection(
              colour.value,
              intersection(
                selected?.variant || allIDs,
                selected?.size || allIDs
              )
            ).length < 1
        }))
      )
    optionsSize &&
      setOptionsSize(
        optionsSize.map(size => ({
          ...size,
          isDisabled:
            intersection(
              size.value,
              intersection(
                selected?.variant || allIDs,
                selected?.colour || allIDs
              )
            ).length < 1
        }))
      )

    if (commonIDs.length === 1 && variation) {
      setSelectedVariation({
        image: variation.image,
        sku: variation.sku,
        variant: variation.variant?.variant,
        colour: variation.colour?.colour,
        size: variation.size?.size
      })

      variation.stock > 0 && setAmount(1)
    } else {
      setSelectedVariation(undefined)
      setAmount(undefined)
    }
  }, [selected?.variant, selected?.colour, selected?.size])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!variation || !amount) return

    objectsAdd({
      type: 'variation',
      contentful_id: variation.sys.id,
      contentful_id_url: object.sys.id,
      artist: object.artist,
      image: variation.image || object.imagesCollection?.items[0],
      priceOriginal: variation.priceOriginal,
      priceSale: variation.priceSale,
      stock: variation.stock || 1,
      sku: variation.sku,
      amount,
      // Locale dependent
      name: object.name,
      // Variations
      ...(optionsVariant?.length && {
        variant: variation.variant || null
      }),
      ...(optionsColour?.length && {
        colour: variation.colour || null
      }),
      ...(optionsSize?.length && {
        size: variation.size || null
      })
    })
  }

  return (
    <div className='sell-variations'>
      {(optionsVariant?.length ||
        optionsColour?.length ||
        optionsSize?.length) && (
        <form onSubmit={onSubmit}>
          {optionsVariant?.length && (
            <FormField label={t('variant')}>
              <ReactSelect
                name='variant'
                options={optionsVariant}
                defaultValue={undefined}
                onChange={event =>
                  event && event.value
                    ? setSelected({ ...selected, variant: event.value })
                    : setSelected({ ...selected, variant: undefined })
                }
                isClearable
                isSearchable={false}
                styles={{
                  control: provided => ({
                    ...provided,
                    borderTopLeftRadius: '0px',
                    borderBottomLeftRadius: '0px'
                  })
                }}
              />
            </FormField>
          )}
          {optionsColour?.length && (
            <FormField label={t('colour')}>
              <ReactSelect
                name='colour'
                options={optionsColour}
                defaultValue={undefined}
                onChange={event =>
                  event && event.value
                    ? setSelected({ ...selected, colour: event.value })
                    : setSelected({ ...selected, colour: undefined })
                }
                isClearable
                isSearchable={false}
                styles={{
                  control: provided => ({
                    ...provided,
                    borderTopLeftRadius: '0px',
                    borderBottomLeftRadius: '0px'
                  })
                }}
              />
            </FormField>
          )}
          {optionsSize?.length && (
            <FormField label={t('size')}>
              <ReactSelect
                name='size'
                options={optionsSize}
                defaultValue={undefined}
                onChange={event =>
                  event && event.value
                    ? setSelected({ ...selected, size: event.value })
                    : setSelected({ ...selected, size: undefined })
                }
                isClearable
                isSearchable={false}
                styles={{
                  control: provided => ({
                    ...provided,
                    borderTopLeftRadius: '0px',
                    borderBottomLeftRadius: '0px'
                  })
                }}
              />
            </FormField>
          )}
          <FormField label={t('amount')}>
            <ReactSelect
              options={Array(
                commonIDs.length === 1 && variation
                  ? variation.stock === 1
                    ? 1
                    : 99
                  : 0
              )
                .fill(undefined)
                .map((_, i) => ({ value: i + 1, label: i + 1 }))}
              value={amount ? { value: amount, label: amount } : undefined}
              onChange={e => e && setAmount(e.value)}
              isSearchable={false}
              isDisabled={
                commonIDs.length === 1 && variation
                  ? variation.stock === 0
                  : false
              }
            />
          </FormField>
          {commonIDs.length === 1 && variation ? (
            <Price
              priceSale={(variation.priceSale ?? 0) * (amount || 1)}
              priceOriginal={variation.priceOriginal * (amount || 1)}
            />
          ) : (
            <p className='text-xl'>
              {priceOriginal.min === priceOriginal.max ? (
                <Price priceOriginal={priceOriginal.max} />
              ) : (
                `${currency(
                  min([priceSale.min, priceOriginal.min])!,
                  i18n.language
                )} - ${currency(
                  max([priceSale.max, priceOriginal.max])!,
                  i18n.language
                )}`
              )}
            </p>
          )}
          <Button
            type='submit'
            disabled={
              commonIDs.length !== 1
                ? true
                : !((variation?.stock ?? 0) > 0)
                ? true
                : false
            }
          >
            {commonIDs.length === 1
              ? (variation?.stock ?? 0) > 0
                ? t('add-to-bag')
                : t('out-of-stock')
              : t('select-variation')}
          </Button>
        </form>
      )}
    </div>
  )
}

export default SellVariations
