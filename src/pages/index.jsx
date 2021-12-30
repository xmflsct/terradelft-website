import GridArtist from '@components/grids/grid-artist'
import GridObjectDefault from '@components/grids/grid-object-default'
import Layout from '@components/layout'
import NewsletterPopup from '@components/newsletter-popup'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import React from 'react'

const PageIndex = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle='Terra Delft'
      SEOkeywords={['Terra', 'Delft', 'Terra Delft']}
      SEOdescription='Terra Delft Website'
      containerName='static-index'
    >
      <div className='section-online-shop mb-3'>
        <h2>{t('content.section.online-shop')}</h2>
        <GridObjectDefault
          nodes={data.objects.nodes}
          giftCard={data.giftCard}
          randomize
          limit={6}
        />
      </div>
      <div className='section-collection'>
        <h1>{t('content.section.collection')}</h1>
        <GridArtist data={data.artists.nodes} />
      </div>
      <NewsletterPopup />
    </Layout>
  )
}

export const query = graphql`
  query PageIndex($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-index"] }
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
    objects: allContentfulObject(
      filter: {
        node_locale: { eq: $language }
        sellOnline: { eq: true }
        stock: { ne: 0 }
      }
      limit: 30
    ) {
      nodes {
        ...ObjectDefault
      }
    }
    artists: allContentfulObjectArtist(
      filter: { node_locale: { eq: $language } }
      sort: { fields: fields___artist_lastname, order: ASC }
    ) {
      nodes {
        gatsbyPath(filePath: "/artist/{ContentfulObjectArtist.artist}")
        artist
        image {
          gatsbyImageData(width: 200, quality: 80)
        }
      }
    }
    giftCard: contentfulGiftCard(
      contentful_id: { eq: "owqoj0fTsXPwPeo6VMb2Z" }
    ) {
      images {
        gatsbyImageData(
          aspectRatio: 1
          resizingBehavior: FILL
          cropFocus: FACES
          width: 200
          quality: 80
        )
      }
    }
  }
`

export default PageIndex
