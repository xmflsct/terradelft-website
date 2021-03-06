import { useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from "gatsby-plugin-image";
import React from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../layouts/layout'

const Static404 = () => {
  const image = useStaticQuery(graphql`{
  file(relativePath: {eq: "static-404/404.jpg"}) {
    childImageSharp {
      gatsbyImageData(width: 870, quality: 80, layout: CONSTRAINED)
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
      <GatsbyImage
        image={image.file.childImageSharp.gatsbyImageData}
        backgroundColor='#e8e8e8' />
    </Layout>
  );
}

export default Static404
