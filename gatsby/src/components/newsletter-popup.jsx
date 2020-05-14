import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'gatsby'

const NewsletterPopup = () => {
  const { t, i18n } = useTranslation('static-index', 'constant')

  return (
    <Link
      to={t('constant:slug.static.newsletter.slug', { locale: i18n.language })}
    >
      <Button variant='primary' className='newsletter-popup'>
        {t('static-index:content.newsletter')}
      </Button>
    </Link>
  )
}

export default NewsletterPopup
