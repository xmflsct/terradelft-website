import { faClock, faIdBadge, faMap } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { EventsEvent } from '~/utils/contentful'
import { relativeTime } from '~/utils/formatNumber'

type Props = {
  event: EventsEvent
  type?: 'current' | 'upcoming'
}

const EventInformation: React.FC<Props> = ({ event, type }) => {
  const { t, i18n } = useTranslation('pageExhibitions')

  const datetimeType = type === 'current' ? 'End' : 'Start'

  return (
    <div className='event-information'>
      <div className='information-dates'>
        <FontAwesomeIcon icon={faClock} size='sm' fixedWidth />{' '}
        {type ? (
          <>
            {new Date(event[`datetime${datetimeType}`]).toLocaleDateString(
              i18n.language,
              {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }
            )}
            <small className='ml-2'>
              (
              {t(`content.datetime.${datetimeType}`, {
                datetime: relativeTime(
                  i18n.language,
                  event[`datetime${datetimeType}`]
                )
              })}
              )
            </small>
          </>
        ) : (
          <>
            {' '}
            {new Date(event.datetimeStart).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {' - '}
            {new Date(event.datetimeEnd).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </>
        )}
      </div>
      {type !== 'upcoming' && (
        <>
          {event.organizerCollection?.items.length ? (
            <dl className='information-organizer'>
              <dt>
                <FontAwesomeIcon icon={faIdBadge} size='sm' fixedWidth />{' '}
                {t('content.organizer')}
              </dt>
              {event.organizerCollection.items.map(organizer => (
                <dd key={organizer.name}>{organizer.name}</dd>
              ))}
            </dl>
          ) : null}
          {event.locationCollection?.items.length ? (
            <dl className='information-location'>
              <dt>
                <FontAwesomeIcon icon={faMap} size='sm' fixedWidth />{' '}
                {t('content.location')}
              </dt>
              {event.locationCollection.items.map(location => (
                <dd key={location.name}>{location.name}</dd>
              ))}
            </dl>
          ) : null}
        </>
      )}
    </div>
  )
}

export default EventInformation
