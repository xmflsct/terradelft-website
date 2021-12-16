import Layout from '@components/layout'
import { graphql } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Page404 = () => {
  const { t } = useTranslation()

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

export const query = graphql`
  query Page404($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-404"] }
        language: { eq: $language }
      }
    ) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`

export default Page404
