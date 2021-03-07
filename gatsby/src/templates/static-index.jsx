import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { graphql } from 'gatsby'

import Layout from '../layouts/layout'
import GridArtist from '../components/grids/grid-artist'
import GridObjectDefault from '../components/grids/grid-object-default'
import NewsletterPopup from '../components/newsletter-popup'

const StaticIndex = ({ data }) => {
  const { t } = useTranslation('static-index')

  return (
    <Layout
      SEOtitle='Terra Delft'
      SEOkeywords={['Terra', 'Delft', 'Terra Delft']}
      SEOdescription='Terra Delft Website'
      containerName='static-index'
    >
      <div className='section-online-shop mb-3'>
        <h2>{t('content.section.online-shop')}</h2>
        <GridObjectDefault nodes={data.objects.nodes} randomize limit={6} />
      </div>
      <div className='section-collection'>
        <h1>{t('content.section.collection')}</h1>
        <GridArtist data={data.artists.nodes} />
      </div>
      <NewsletterPopup />
    </Layout>
  )
}

StaticIndex.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticIndex($locale: String) {
    objects: allContentfulObject(
      filter: { sellOnline: { eq: true }, node_locale: { eq: $locale } }
      limit: 36
    ) {
      nodes {
        ...ObjectDefault
      }
    }
    artists: allContentfulObjectArtist(
      filter: { node_locale: { eq: $locale } }
      sort: { fields: fields___artist_lastname, order: ASC }
    ) {
      nodes {
        node_locale
        artist
        image {
          gatsbyImageData(layout: CONSTRAINED, quality: 80)
        }
        fields {
          artist_lastname
        }
      }
    }
  }
`

export default StaticIndex
