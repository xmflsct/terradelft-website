import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import { BagContext } from '~/states/bag'
import { currency } from '~/utils/formatNumber'
import Button from '../button'
import ContentfulImage from '../image'
import { Link } from '../link'
import Price from '../object/price'

const BagList: React.FC = () => {
  const { objects, objectsAdd, objectsRemove } = useContext(BagContext)

  const { t, i18n } = useTranslation('pageBag')

  if (objects.length === 0) {
    return (
      <div>
        <p>{t('content.list.empty')}</p>
      </div>
    )
  }

  return (
    <>
      {objects.map((object, index) => {
        return (
          <div
            key={object.contentful_id}
            className='mb-4 grid grid-cols-12 gap-4'
          >
            <div className='col-span-5'>
              <ContentfulImage
                image={object.image}
                width={221}
                quality={80}
                behaviour='fill'
                focusArea='faces'
              />
            </div>
            <div className='col-span-7 relative'>
              <div className='text-xl font-medium pr-12'>
                <Link to={`/object/${object.contentful_id_url}`}>
                  {object.name[i18n.language]}
                </Link>
              </div>
              <table className='table-auto my-2'>
                <tbody>
                  {object.artist ? (
                    <tr>
                      <th className='text-left py-1 pr-4'>
                        {t('pageObject:artist')}
                      </th>
                      <td>
                        <Link to={`/artist/${object.artist.slug}`}>
                          {object.artist.artist}
                        </Link>
                      </td>
                    </tr>
                  ) : null}
                  {object.variant && (
                    <tr>
                      <th className='text-left py-1 pr-4'>
                        {t('pageObject:variant')}
                      </th>
                      <td>{object.variant[i18n.language]}</td>
                    </tr>
                  )}
                  {object.colour && (
                    <tr>
                      <th className='text-left py-1 pr-4'>
                        {t('pageObject:colour')}
                      </th>
                      <td>{object.colour[i18n.language]}</td>
                    </tr>
                  )}
                  {object.size && (
                    <tr>
                      <th className='text-left py-1 pr-4'>
                        {t('pageObject:size')}
                      </th>
                      <td>{object.size[i18n.language]}</td>
                    </tr>
                  )}
                  <tr>
                    <th className='text-left py-1 pr-4'>
                      {t('pageObject:price')}
                    </th>
                    <td>
                      {currency(
                        object.priceSale || object.priceOriginal,
                        i18n.language
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th className='text-left py-1 pr-4'>
                      {t('pageObject:amount')}
                    </th>
                    <td>
                      <ReactSelect
                        options={Array(object.stock === 1 ? 1 : 50)
                          .fill(undefined)
                          .map((_, i) => ({ value: i + 1, label: i + 1 }))}
                        defaultValue={{
                          value: object.amount,
                          label: object.amount
                        }}
                        onChange={e => {
                          e && objectsAdd({ ...object, amount: e.value })
                        }}
                        isSearchable={false}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Price
                priceSale={(object.priceSale || 0) * object.amount}
                priceOriginal={object.priceOriginal * object.amount}
              />
              <div className='absolute top-0 right-0'>
                <Button
                  className='text-secondary px-2 py-1 rounded hover:bg-secondary hover:text-white'
                  onClick={() => objectsRemove(object.contentful_id)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default BagList
