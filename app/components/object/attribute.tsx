import { useTranslation } from 'react-i18next'
import { dimension } from '~/utils/formatNumber'
import { Link } from '../link'

type Props = {
  type: string
  value: number | string[]
}

const ObjectAttribute: React.FC<Props> = ({ type, value }) => {
  const { i18n } = useTranslation('pageObject')

  return (
    <tr>
      <th className='text-left py-1 pr-4'>{type}</th>
      {!Array.isArray(value) ? (
        <td>
          {typeof value === 'object'
            ? // Year only
              value[Object.keys(value)[0]]
            : // Dimensions only
              dimension(value, i18n.language)}
        </td>
      ) : (
        // Technique and material, many references
        <td>
          {value.map((d, i) => (
            <span key={i}>
              <Link to={`/object/attribute/${type}/${d}`}>{d}</Link>
              {i !== value.length - 1 && ', '}
            </span>
          ))}
        </td>
      )}
    </tr>
  )
}

export default ObjectAttribute
