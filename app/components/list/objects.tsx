import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { GiftCard, ObjectsObject } from '~/utils/contentful'
import ContentfulImage from '../image'
import { Link } from '../link'

type Props = {
  objects: Pick<ObjectsObject, 'sys' | 'imagesCollection' | 'priceSale' | 'name'>[]
  giftCard?: GiftCard | null
}

const ListObjects: React.FC<Props> = ({ objects, giftCard }) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-4 lg:gap-y-8'>
      {giftCard ? (
        <div className='group cursor-pointer'>
          <Link to='/gift-card'>
            <ContentfulImage
              image={giftCard.imagesCollection?.items[0]}
              width={164}
              height={164}
              quality={80}
              behaviour='fill'
              focusArea='faces'
              className='group-hover:opacity-50'
            />
            <p className='mt-2 font-bold text-secondary text-center group-hover:underline underline-offset-4'>
              {t('common:gift-card.name')}
              <br />€ 20 - 100
            </p>
          </Link>
        </div>
      ) : null}
      {objects.map(object => {
        return (
          <div key={object.sys.id} className='group cursor-pointer'>
            <Link to={`/object/${object.sys.id}`}>
              <div className='relative'>
                {object.imagesCollection?.items.length && (
                  <ContentfulImage
                    image={object.imagesCollection.items[0]}
                    width={164}
                    height={164}
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
  )
}

export const LIST_OBJECT_DETAILS = gql`
  fragment ListObjectDetails on ObjectsObject {
    sys {
      id
    }
    imagesCollection(limit: 1) {
      items {
        url
        title
        width
        height
      }
    }
    priceSale
    name(locale: $locale)
  }
`

export default ListObjects
