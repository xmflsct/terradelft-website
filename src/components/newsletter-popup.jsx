import { Link, useTranslation } from 'gatsby-plugin-react-i18next'
import React from 'react'
import { Button } from 'react-bootstrap'

const NewsletterPopup = () => {
  const { t } = useTranslation()

  return (
    <Link to='/newsletter'>
      <Button variant='primary' className='newsletter-popup'>
        {t('page-index:content.newsletter')}
      </Button>
    </Link>
  )
}

export default NewsletterPopup
