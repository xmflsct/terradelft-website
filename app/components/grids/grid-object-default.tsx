import { useTranslation } from 'react-i18next'
import { ObjectsObject } from '~/utils/contentful'
import ContentfulImage from '../image'
import { Link } from '../link'

type Props = {
  objects: ObjectsObject[]
  giftCard?: boolean
}

const GridObjectDefault: React.FC<Props> = ({ objects, giftCard = false }) => {
  const { t } = useTranslation()

  return (
    <div className='grid grid-cols-6 gap-x-4 gap-y-8'>
      {/* {giftCard ? (
        <div className='grid-item'>
          <Link to='/gift-card'>
            <ContentfulImage
              alt={d.artist}
              image={d.image}
              width={180}
              height={180}
              quality={85}
              behaviour='fill'
              focusArea='faces'
              className='group-hover:opacity-50'
            />
            <p className='item-name' style={{ fontWeight: 'bold' }}>
              {t('common:gift-card.name')}
              <br />€ 20 - 100
            </p>
          </Link>
        </div>
      ) : null} */}
      {objects.map(object => {
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
  )
}

export default GridObjectDefault
