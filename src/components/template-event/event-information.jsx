import React from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faIdBadge, faMap } from "@fortawesome/free-regular-svg-icons"
import moment from "moment"
import "moment/locale/nl"

const EventInformation = ({ event, type }) => {
  const { t, i18n } = useTranslation("component-event")
  moment.locale(i18n.language)
  type === "upcoming" && (type = "Start")
  type === "current" && (type = "End")

  return (
    <div className='event-information'>
      <div className='information-dates'>
        <FontAwesomeIcon icon={faClock} size='sm' fixedWidth />{" "}
        {type ? (
          <>
            {moment(event[`datetime${type}`]).format(
              event.datetimeAllDay ? "ll" : "lll"
            )}{" "}
            <small>
              (
              {t(`datetime.${type}`, {
                datetime: moment(event[`datetime${type}`]).fromNow(),
              })}
              )
            </small>
          </>
        ) : (
          <>
            {moment(event.datetimeStart).format(
              event.datetimeAllDay ? "ll" : "lll"
            )}
            {" - "}
            {moment(event.datetimeEnd).format(
              event.datetimeAllDay ? "ll" : "lll"
            )}
          </>
        )}
      </div>
      {type !== "Start" && (
        <>
          {event.organizer && (
            <dl className='information-organizer'>
              <dt>
                <FontAwesomeIcon icon={faIdBadge} size='sm' fixedWidth />{" "}
                {t("organizer")}
              </dt>
              {event.organizer.map((o) => (
                <dd key={o.name}>{o.name}</dd>
              ))}
            </dl>
          )}
          {event.location && (
            <dl className='information-location'>
              <dt>
                <FontAwesomeIcon icon={faMap} size='sm' fixedWidth />{" "}
                {t("location")}
              </dt>
              {event.location.map((o) => (
                <dd key={o.name}>{o.name}</dd>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  )
}

export default EventInformation
