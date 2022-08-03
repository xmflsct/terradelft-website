import { json, LoaderArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { sumBy } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import Button from '~/components/button'
import FormField from '~/components/formField'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import ObjectImages from '~/components/object/images'
import Price from '~/components/object/price'
import RichText from '~/components/richText'
import { cacheQuery, GiftCard, RICH_TEXT_LINKS } from '~/utils/contentful'

export const loader = async (args: LoaderArgs) => {
  const data = await cacheQuery<{ giftCard: GiftCard }>({
    ...args,
    query: gql`
      query PageIndex($locale: String!) {
        giftCard(locale: $locale, id: "owqoj0fTsXPwPeo6VMb2Z") {
          imagesCollection(limit: 5) {
            items {
              url
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

  return json(data)
}

export const handle = {
  i18n: ['giftCard', 'object']
}

const PageGiftCard = () => {
  const { giftCard } = useLoaderData<typeof loader>()
  const { t } = useTranslation('giftCard')
  console.log(giftCard)

  const [quantity, setQuantity] = useState(
    Object.fromEntries(
      giftCard.defaultAmounts.map(amount => [parseInt(amount), 0])
    )
  )
  const [amountCustom, setAmountCustom] = useState(0)
  const [theAmount, setTheAmount] = useState<number>()
  const [theAmountDirty, setTheAmountDirty] = useState(false)

  // const dispatch = useDispatch()
  // const onSubmit = e => {
  //   e.preventDefault()
  //   Object.keys(quantity).forEach(amount => {
  //     if (quantity[amount] > 0) {
  //       dispatch(
  //         bagAdd({
  //           type: 'giftcard',
  //           gatsbyPath: '/gift-card',
  //           contentful_id: `custom-gift-card-${amount}`,
  //           priceOriginal: parseInt(amount),
  //           image: data.contentfulGiftCard.images[0],
  //           stock: 50,
  //           amount: quantity[amount],
  //           // Locale dependent
  //           name: {
  //             nl: t('translation:gift-card.amount.nl', { amount }),
  //             en: t('translation:gift-card.amount.en', { amount })
  //           }
  //         })
  //       )
  //     }
  //   })
  //   theAmount >= data.contentfulGiftCard.customAmountMinimum &&
  //     amountCustom > 0 &&
  //     dispatch(
  //       bagAdd({
  //         type: 'giftcard',
  //         gatsbyPath: '/gift-card',
  //         contentful_id: 'custom-gift-card-custom',
  //         priceOriginal: theAmount,
  //         image: data.contentfulGiftCard.images[0],
  //         stock: 50,
  //         amount: amountCustom,
  //         // Locale dependent
  //         name: {
  //           nl: t('translation:gift-card.amount.nl', { amount: theAmount }),
  //           en: t('translation:gift-card.amount.en', { amount: theAmount })
  //         }
  //       })
  //     )
  // }

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-4'>
          {giftCard.imagesCollection.items.map((image, index) => (
            <ContentfulImage key={index} image={image} width={471} />
          ))}
        </div>
        <div>
          <H1>{t('common:gift-card:name')}</H1>
          <form>
            {giftCard.defaultAmounts.map(amount => (
              <FormField label={t('amount', { amount })}>
                <ReactSelect
                  name='bagAdd'
                  options={Array(5)
                    .fill(undefined)
                    .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                  value={{ value: quantity[amount], label: quantity[amount] }}
                  isSearchable={false}
                  onChange={e =>
                    e && setQuantity({ ...quantity, [amount]: e.value })
                  }
                  styles={{
                    control: provided => ({
                      ...provided,
                      borderTopLeftRadius: '0px',
                      borderBottomLeftRadius: '0px'
                    })
                  }}
                />
              </FormField>
            ))}
            {giftCard.customAmountAllow ? (
              <>
                <FormField label={t('amount', { amount: '' })}>
                  <div className='flex flex-row'>
                    <input
                      autoComplete='off'
                      value={theAmount}
                      onChange={e => {
                        setTheAmountDirty(true)
                        setTheAmount(Math.ceil(parseFloat(e.target.value)))
                      }}
                    />
                    <ReactSelect
                      name='bagAdd'
                      options={Array(5)
                        .fill(undefined)
                        .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                      value={{ value: amountCustom, label: amountCustom }}
                      isSearchable={false}
                      onChange={e => e && setAmountCustom(e.value)}
                      styles={{
                        control: provided => ({
                          ...provided,
                          borderTopLeftRadius: '0px',
                          borderBottomLeftRadius: '0px',
                          flexGrow: 1
                        })
                      }}
                    />
                    {theAmountDirty &&
                    giftCard.customAmountMinimum &&
                    amountCustom < giftCard.customAmountMinimum ? (
                      <div>
                        {t('minimum', {
                          amount: giftCard.customAmountMinimum
                        })}
                      </div>
                    ) : null}
                  </div>
                </FormField>
                {/* <InputGroup>
                  <InputGroup.Text>
                    {t('content.amount', { amount: '' })}
                  </InputGroup.Text>
                  <FormControl
                    type='number'
                    value={theAmount}
                    onChange={e => {
                      setTheAmountDirty(true)
                      setTheAmount(Math.ceil(e.target.value))
                    }}
                    style={{ flex: 0.18 }}
                    isInvalid={
                      theAmountDirty &&
                      theAmount < data.contentfulGiftCard.customAmountMinimum
                    }
                  />
                  <div className='form-selection'>
                    <ReactSelect
                      options={Array(50)
                        .fill()
                        .map((_, i) => ({ value: i, label: i }))}
                      value={{ value: amountCustom, label: amountCustom }}
                      onChange={e => setAmountCustom(e.value)}
                      isSearchable={false}
                    />
                  </div>
                  <FormControl.Feedback type='invalid'>
                    {t('content.minimum', {
                      amount: data.contentfulGiftCard.customAmountMinimum
                    })}
                  </FormControl.Feedback>
                </InputGroup> */}
              </>
            ) : null}
            <Price
              priceOriginal={
                sumBy(
                  Object.keys(quantity),
                  amount => parseInt(amount) * quantity[amount]
                ) +
                amountCustom * (theAmount || 0)
              }
            />
            <Button type='submit'>{t('object:add-to-bag')}</Button>
          </form>
          <RichText
            content={giftCard.description}
            className='mt-2'
            assetWidth={634}
          />
        </div>
      </div>
    </>
  )
}

export default PageGiftCard
