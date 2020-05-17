import React from 'react'
import { useTranslation } from 'react-i18next'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'

import Layout from '../layouts/layout'

const Static404 = () => {
  const image = useStaticQuery(graphql`
    {
      file(relativePath: { eq: "static-404/404.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 870, quality: 80) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  const { t } = useTranslation('static-404')

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={['Terra', 'Delft', 'Terra Delft']}
      SEOdescription='404'
      containerName='static-404'
    >
      <h1>{t('content.heading')}</h1>
      <Img fluid={image.file.childImageSharp.fluid} backgroundColor='#e8e8e8' />
    </Layout>
  )
}

export default Static404
