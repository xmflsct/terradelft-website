import { find, includes } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { ObjectsObject } from '~/utils/contentful'
import { currency } from '~/utils/formatNumber'
import ContentfulImage from '../image'
import { Link } from '../link'

type Props = {
  objects: ObjectsObject[]
  giftCard?: boolean
}

const GridObjectOnlineShop: React.FC<Props> = ({
  objects,
  giftCard = false
}) => {
  const { t, i18n } = useTranslation()

  const [selected, setSelected] = useState({
    price: null,
    artist: null,
    variant: null
  })
  const options = {
    prices: [
      {
        label: `< ${currency(50, i18n.language)}`,
        value: { minimum: 0, maximum: 50 }
      },
      {
        label: `${currency(50, i18n.language)} - ${currency(
          100,
          i18n.language
        )}`,
        value: { minimum: 50, maximum: 100 }
      },
      {
        label: `${currency(100, i18n.language)} - ${currency(
          200,
          i18n.language
        )}`,
        value: { minimum: 100, maximum: 200 }
      },
      {
        label: `${currency(200, i18n.language)} - ${currency(
          300,
          i18n.language
        )}`,
        value: { minimum: 200, maximum: 300 }
      },
      {
        label: `${currency(300, i18n.language)} - ${currency(
          500,
          i18n.language
        )}`,
        value: { minimum: 300, maximum: 500 }
      },
      {
        label: `> ${currency(500, i18n.language)}`,
        value: { minimum: 500, maximum: 99999 }
      }
    ],
    artists: [],
    variants: []
  }
  objects.forEach(object => {
    if (object.artist) {
      find(options.artists, ['label', object.artist.artist]) ||
        options.artists.push({
          label: object.artist.artist,
          value: object.artist.artist
        })
    }

    object.variationsCollection?.items &&
      object.variationsCollection.items.forEach(v => {
        find(options.variants, ['label', v]) ||
          options.variants.push({
            label: v,
            value: v
          })
      })
  })

  return (
    <>
      <h4>{t('page-shop:content.filters.heading')}</h4>
      <div className='filter-grid mb-3'>
        <div className='mb-3'>
          <Select
            name='prices'
            isClearable
            isSearchable
            options={options.prices}
            placeholder={t('page-shop:content.filters.prices')}
            onChange={d =>
              setSelected({ ...selected, price: d ? d.value : null })
            }
          />
        </div>
        <div className='mb-3'>
          <Select
            name='artists'
            isClearable
            isSearchable
            options={options.artists}
            placeholder={t('page-shop:content.filters.artists')}
            onChange={d =>
              setSelected({ ...selected, artist: d ? d.value : null })
            }
          />
        </div>
        <div className='mb-3'>
          <Select
            name='variants'
            isClearable
            isSearchable
            options={options.variants}
            placeholder={t('page-shop:content.filters.variants')}
            onChange={d =>
              setSelected({ ...selected, variant: d ? d.value : null })
            }
          />
        </div>
      </div>
      <div className='grid grid-cols-6 gap-x-4 gap-y-8'>
        {/* {giftCard &&
        !selected.price &&
        !selected.artist &&
        !selected.variant ? (
          <div className='grid-item'>
            <Link to='/gift-card'>
              <div className='item-image'>
                <GatsbyImage
                  alt='Gift Card'
                  image={giftCard.images[0].gatsbyImageData}
                />
              </div>
              <p className='item-name' style={{ fontWeight: 'bold' }}>
                {t('translation:gift-card.name')}
                <br />€ 20 - 100
              </p>
            </Link>
          </div>
        ) : null} */}
        {objects
          // .filter(object => {
          //   let objectMatch = {
          //     prices: null,
          //     artists: null,
          //     variants: null
          //   }
          //   for (const match in selected) {
          //     const selectedValue = selected[match]
          //     if (!selectedValue) {
          //       continue
          //     }
          //     switch (match) {
          //       case 'price':
          //         objectMatch.prices = object.fields.object_variants
          //           ? !(
          //               object.fields.variations_price_range.highest <
          //                 selectedValue.minimum ||
          //               object.fields.variations_price_range.lowest >
          //                 selectedValue.maximum
          //             )
          //           : !(
          //               object.priceSale ||
          //               object.priceOriginal < selectedValue.minimum ||
          //               object.priceSale ||
          //               object.priceOriginal > selectedValue.maximum
          //             )
          //         break
          //       case 'artist':
          //         objectMatch.artists = selectedValue === object.artist?.artist
          //         break
          //       case 'variant':
          //         objectMatch.variants = object.fields.object_variants
          //           ? includes(object.fields.object_variants, selectedValue)
          //           : false
          //         break
          //       default:
          //         break
          //     }
          //   }

          //   return (
          //     objectMatch.prices !== false &&
          //     objectMatch.artists !== false &&
          //     objectMatch.variants !== false
          //   )
          // })
          .map(object => {
            return (
              <div key={object.sys.id} className='group cursor-pointer'>
                <Link to={`/object/${object.sys.id}`}>
                  <div className='relative'>
                    {object.imagesCollection?.items.length && (
                      <ContentfulImage
                        image={object.imagesCollection.items[0]}
                        width={148}
                        height={148}
                        quality={80}
                        behaviour='fill'
                        focusArea='faces'
                        className='group-hover:opacity-50'
                      />
                    )}
                    {object.priceSale && (
                      <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-secondary text-background text-sm font-semibold'>
                        {t('object:on-sale')}
                      </span>
                    )}
                  </div>
                  <p className='mt-2 text-secondary text-center group-hover:underline underline-offset-4'>
                    {object.name}
                  </p>
                </Link>
              </div>
            )
          })}
      </div>
    </>
  )
}

export default GridObjectOnlineShop
