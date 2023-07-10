import { difference, findIndex, intersection, max, min, union } from 'lodash'
import { Dispatch, FormEvent, SetStateAction, useContext, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { SelectedImages, SelectedVariation } from '~/routes/$locale.object.$id'
import { BagContext } from '~/states/bag'
import {
  ObjectsObjectVariation_NameLocalized,
  ObjectsObject_NameLocalized
} from '~/utils/contentful'
import { currency } from '~/utils/formatNumber'
import Button from '../button'
import FormField from '../formField'
import Price from './price'
import { selectStyle } from './sell'

type Props = {
  object: Omit<ObjectsObject_NameLocalized, 'variationsCollection'> & {
    variationsCollection: { items: ObjectsObjectVariation_NameLocalized[] }
  }
  setSelectedImages: Dispatch<SetStateAction<SelectedImages>>
  setSelectedVariation: Dispatch<SetStateAction<SelectedVariation>>
}

const SellVariations: React.FC<Props> = ({ object, setSelectedImages, setSelectedVariation }) => {
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

  type Option = { value: string[]; label: string; isDisabled: boolean }
  const [optionsVariant, setOptionsVariant] = useState<Option[]>()
  const [optionsColour, setOptionsColour] = useState<Option[]>()
  const [optionsSize, setOptionsSize] = useState<Option[]>()
  const [selected, setSelected] = useState<{
    variant: Option | null
    colour: Option | null
    size: Option | null
  }>({ variant: null, colour: null, size: null })
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    const d: { variant: Option[]; colour: Option[]; size: Option[] } = {
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
          label: t('object:option-default'),
          value: difference(variationsRange, dValue),
          isDisabled: false
        })
      }
    }

    setOptionsVariant(() => d.variant)
    setOptionsColour(() => d.colour)
    setOptionsSize(() => d.size)
    setSelected({ variant: null, colour: null, size: null })
    setAmount(null)
  }, [object.sys.id, i18n.language])

  const [commonIDs, setCommonIDs] = useState<string[]>([])
  const [theVariation, setTheVariation] = useState<ObjectsObjectVariation_NameLocalized | null>(
    null
  )

  useEffect(() => {
    let IDs: string[] = []
    let variation: ObjectsObjectVariation_NameLocalized | null = null
    if (
      selected?.variant?.value?.length ||
      selected?.colour?.value.length ||
      selected?.size?.value.length
    ) {
      IDs = intersection(
        selected?.variant?.value || allIDs,
        selected?.colour?.value || allIDs,
        selected?.size?.value || allIDs
      )
      setCommonIDs(IDs)
      if (IDs.length === 1) {
        variation = sellVariations[sellVariations.findIndex(v => v.sys.id === IDs[0])]
        setTheVariation(variation)
      } else {
        setTheVariation(null)
      }
    } else {
      setCommonIDs([])
      setTheVariation(null)
    }
    optionsVariant &&
      setOptionsVariant(
        optionsVariant.map(variant => ({
          ...variant,
          isDisabled:
            intersection(
              variant.value,
              intersection(selected?.colour?.value || allIDs, selected?.size?.value || allIDs)
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
              intersection(selected?.variant?.value || allIDs, selected?.size?.value || allIDs)
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
              intersection(selected?.variant?.value || allIDs, selected?.colour?.value || allIDs)
            ).length < 1
        }))
      )

    if (IDs.length === 1 && variation) {
      setSelectedImages([])
      setSelectedVariation({
        image: variation.image,
        sku: variation.sku,
        variant: variation.variant?.[i18n.language],
        colour: variation.colour?.[i18n.language],
        size: variation.size?.[i18n.language]
      })

      variation.stock > 0 && setAmount(1)
    } else {
      setSelectedImages(sellVariations.filter(v => IDs.includes(v.sys.id)).map(v => v.image))
      setSelectedVariation(null)
      setAmount(null)
    }
  }, [selected.variant, selected.colour, selected.size])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!theVariation || !amount) return

    objectsAdd({
      type: 'variation',
      contentful_id: theVariation.sys.id,
      contentful_id_url: object.sys.id,
      artist: object.artist,
      image: theVariation.image || object.imagesCollection?.items[0],
      priceOriginal: theVariation.priceOriginal,
      priceSale: theVariation.priceSale,
      stock: theVariation.stock || 1,
      sku: theVariation.sku,
      amount,
      // Locale dependent
      name: object.name,
      // Variations
      ...(optionsVariant?.length && {
        variant: theVariation.variant || null
      }),
      ...(optionsColour?.length && {
        colour: theVariation.colour || null
      }),
      ...(optionsSize?.length && {
        size: theVariation.size || null
      })
    })
  }

  return (
    <div className='sell-variations'>
      {(optionsVariant?.length || optionsColour?.length || optionsSize?.length) && (
        <form onSubmit={onSubmit}>
          {optionsVariant?.length && (
            <FormField label={t('variant')}>
              <Select
                instanceId={useId()}
                name='variant'
                options={optionsVariant}
                value={selected.variant}
                onChange={event => {
                  setSelected(value => ({ ...value, variant: event }))
                }}
                isClearable
                isSearchable={false}
                styles={selectStyle}
              />
            </FormField>
          )}
          {optionsColour?.length && (
            <FormField label={t('colour')}>
              <Select
                instanceId={useId()}
                name='colour'
                options={optionsColour}
                value={selected.colour}
                onChange={event => {
                  setSelected(value => ({ ...value, colour: event }))
                }}
                isClearable
                isSearchable={false}
                styles={selectStyle}
              />
            </FormField>
          )}
          {optionsSize?.length && (
            <FormField label={t('size')}>
              <Select
                instanceId={useId()}
                name='size'
                options={optionsSize}
                value={selected.size}
                onChange={event => {
                  setSelected(value => ({ ...value, size: event }))
                }}
                isClearable
                isSearchable={false}
                styles={selectStyle}
              />
            </FormField>
          )}
          <FormField label={t('amount')}>
            <Select
              instanceId={useId()}
              options={Array(
                commonIDs.length === 1 && theVariation ? (theVariation.stock === 1 ? 1 : 99) : 0
              )
                .fill(undefined)
                .map((_, i) => ({ value: i + 1, label: i + 1 }))}
              value={amount ? { value: amount, label: amount } : undefined}
              onChange={e => e && setAmount(e.value)}
              isSearchable={false}
              isDisabled={commonIDs.length === 1 && theVariation ? theVariation.stock === 0 : false}
              styles={selectStyle}
            />
          </FormField>

          {commonIDs.length === 1 && theVariation ? (
            <Price
              priceSale={(theVariation.priceSale ?? 0) * (amount || 1)}
              priceOriginal={theVariation.priceOriginal * (amount || 1)}
            />
          ) : priceOriginal.min === priceOriginal.max ? (
            <Price priceOriginal={priceOriginal.max} />
          ) : (
            <p className='text-xl'>
              {`${currency(min([priceSale.min, priceOriginal.min])!, i18n.language)} - ${currency(
                max([priceSale.max, priceOriginal.max])!,
                i18n.language
              )}`}
            </p>
          )}
          <Button
            type='submit'
            disabled={
              commonIDs.length !== 1 ? true : !((theVariation?.stock ?? 0) > 0) ? true : false
            }
          >
            {commonIDs.length === 1
              ? (theVariation?.stock ?? 0) > 0
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
