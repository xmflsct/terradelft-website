import { faClock, faIdBadge, faMap } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { EventsEvent } from '~/utils/contentful'
import { relativeTime } from '~/utils/formatNumber'

type Props = {
  exhibition: Pick<EventsEvent, 'datetimeStart' | 'datetimeEnd'> &
    Partial<Pick<EventsEvent, 'typeCollection' | 'organizerCollection' | 'locationCollection'>>
  type?: 'current' | 'upcoming'
}

const ExhibitionInformation: React.FC<Props> = ({ exhibition, type }) => {
  const { t, i18n } = useTranslation('exhibition')

  const datetimeType = type === 'current' ? 'End' : 'Start'

  return (
    <div>
      <div className='flex flex-row gap-2 my-1'>
        {exhibition.typeCollection?.items.map(type => (
          <span
            key={type.name}
            children={type.name}
            className='bg-secondary text-white rounded-md text-xs font-semibold px-2 py-1'
          />
        ))}
      </div>
      <div>
        <FontAwesomeIcon icon={faClock} size='sm' fixedWidth />{' '}
        {type ? (
          <>
            {new Date(exhibition[`datetime${datetimeType}`]).toLocaleDateString(i18n.language, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            <small className='ml-2'>
              (
              {t(`datetime.${datetimeType}`, {
                datetime: relativeTime(i18n.language, exhibition[`datetime${datetimeType}`])
              })}
              )
            </small>
          </>
        ) : (
          <>
            {' '}
            {new Date(exhibition.datetimeStart).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {' - '}
            {new Date(exhibition.datetimeEnd).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </>
        )}
      </div>
      {type !== 'upcoming' && (
        <>
          {exhibition.organizerCollection?.items.length ? (
            <dl>
              <dt>
                <FontAwesomeIcon icon={faIdBadge} size='sm' fixedWidth /> {t('organizer')}
              </dt>
              {exhibition.organizerCollection.items.map(organizer => (
                <dd key={organizer.name}>{organizer.name}</dd>
              ))}
            </dl>
          ) : null}
          {exhibition.locationCollection?.items.length ? (
            <dl>
              <dt>
                <FontAwesomeIcon icon={faMap} size='sm' fixedWidth /> {t('location')}
              </dt>
              {exhibition.locationCollection.items.map(location => (
                <dd key={location.name}>{location.name}</dd>
              ))}
            </dl>
          ) : null}
        </>
      )}
    </div>
  )
}

export default ExhibitionInformation
