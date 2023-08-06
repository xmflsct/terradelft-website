import { json, LoaderArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { sumBy } from 'lodash'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import Button from '~/components/button'
import FormField from '~/components/formField'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import Price from '~/components/object/price'
import { selectStyle } from '~/components/object/sell'
import RichText from '~/components/richText'
import { BagContext } from '~/states/bag'
import cache from '~/utils/cache'
import { GiftCard, graphqlRequest, RICH_TEXT_LINKS } from '~/utils/contentful'

export const loader = async (args: LoaderArgs) => {
  const data = await cache<{ giftCard: GiftCard }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageGiftCard($preview: Boolean, $locale: String!) {
          giftCard(
            preview: $preview
            locale: $locale
            id: "owqoj0fTsXPwPeo6VMb2Z"
          ) {
            imagesCollection(limit: 5) {
              items {
                url
                title
                width
                height
              }
            }
            defaultAmounts
            customAmountAllow
            customAmountMinimum
            description {
              json
              ${RICH_TEXT_LINKS}
            }
          }
        }
      `
    })
  })

  return json(data)
}

export const handle = {
  i18n: ['giftCard', 'object']
}

const PageGiftCard: React.FC = () => {
  const { objectsAdd } = useContext(BagContext)

  const { giftCard } = useLoaderData<typeof loader>()
  const { t } = useTranslation('giftCard')

  const [quantity, setQuantity] = useState<{ [k: string]: number | undefined }>(
    Object.fromEntries(giftCard.defaultAmounts.map(amount => [parseInt(amount), undefined]))
  )
  const [amountCustom, setAmountCustom] = useState<number>()
  const [theAmount, setTheAmount] = useState<number | undefined>(50)
  const [theAmountDirty, setTheAmountDirty] = useState(false)

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='flex flex-col gap-4'>
          {giftCard.imagesCollection?.items.map((image, index) => (
            <ContentfulImage key={index} image={image} width={471} />
          ))}
        </div>
        <div>
          <H1>{t('common:gift-card:name')}</H1>
          <form
            onSubmit={e => {
              e.preventDefault()
              Object.keys(quantity).forEach(amount => {
                const amt = quantity[amount]
                if (amt && amt > 0) {
                  objectsAdd({
                    type: 'giftcard',
                    contentful_id: `custom-gift-card-${amount}`,
                    contentful_id_url: '/gift-card',
                    priceOriginal: parseInt(amount),
                    image: giftCard.imagesCollection?.items[0],
                    stock: 10,
                    amount: amt,
                    name: {
                      nl: t('common:gift-card.amount.nl', { amount }),
                      en: t('common:gift-card.amount.en', { amount })
                    }
                  })
                }
              })
              theAmount &&
                giftCard.customAmountMinimum &&
                theAmount >= giftCard.customAmountMinimum &&
                amountCustom &&
                amountCustom > 0 &&
                objectsAdd({
                  type: 'giftcard',
                  contentful_id: 'custom-gift-card-custom',
                  contentful_id_url: '/gift-card',
                  priceOriginal: theAmount,
                  image: giftCard.imagesCollection?.items[0],
                  stock: 10,
                  amount: amountCustom,
                  // Locale dependent
                  name: {
                    nl: t('common:gift-card.amount.nl', { amount: theAmount }),
                    en: t('common:gift-card.amount.en', { amount: theAmount })
                  }
                })
            }}
          >
            {giftCard.defaultAmounts.map((amount, index) => (
              <FormField key={index} label={t('amount', { amount })}>
                <ReactSelect
                  options={Array(11)
                    .fill(undefined)
                    .map((_, i) => ({ value: i, label: i }))}
                  value={{ value: quantity[amount], label: quantity[amount] }}
                  isSearchable={false}
                  onChange={e => e && setQuantity({ ...quantity, [amount]: e.value })}
                  styles={selectStyle}
                />
              </FormField>
            ))}
            {giftCard.customAmountAllow ? (
              <>
                <FormField label={t('amount', { amount: '' })}>
                  <div className='w-full flex flex-col'>
                    <div className='flex flex-row'>
                      <input
                        autoComplete='off'
                        value={theAmount}
                        onChange={e => {
                          if (!e.target.value) {
                            setTheAmountDirty(false)
                            setTheAmount(undefined)
                          } else {
                            setTheAmountDirty(true)
                            setTheAmount(Math.ceil(parseFloat(e.target.value)))
                          }
                        }}
                        size={4}
                        className='border border-r-0 border-stone-200 px-4 py-2'
                        inputMode='decimal'
                        pattern='[0-9]*'
                      />
                      <ReactSelect
                        options={Array(11)
                          .fill(undefined)
                          .map((_, i) => ({ value: i, label: i }))}
                        value={{ value: amountCustom, label: amountCustom }}
                        isSearchable={false}
                        onChange={e => e && setAmountCustom(e.value)}
                        styles={selectStyle}
                      />
                    </div>
                    {theAmountDirty &&
                    theAmount &&
                    giftCard.customAmountMinimum &&
                    theAmount < giftCard.customAmountMinimum ? (
                      <div className='text-sm text-secondary'>
                        {t('minimum', { amount: giftCard.customAmountMinimum })}
                      </div>
                    ) : null}
                  </div>
                </FormField>
              </>
            ) : null}
            <Price
              priceOriginal={
                sumBy(Object.keys(quantity), amount => parseInt(amount) * (quantity[amount] || 0)) +
                (amountCustom || 0) * (theAmount || 0)
              }
            />
            <Button type='submit'>{t('object:add-to-bag')}</Button>
          </form>
          <RichText content={giftCard.description} className='mt-2' assetWidth={634} />
        </div>
      </div>
    </>
  )
}

export default PageGiftCard
