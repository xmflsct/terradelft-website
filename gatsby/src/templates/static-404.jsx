import { StaticImage } from 'gatsby-plugin-image'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../layouts/layout'

const Static404 = () => {
  const { t } = useTranslation('static-404')

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={['Terra', 'Delft', 'Terra Delft']}
      SEOdescription='404'
      containerName='static-404'
    >
      <h1>{t('content.heading')}</h1>
      <StaticImage src='../images/static-404/404.jpg' />
    </Layout>
  )
}

export default Static404
