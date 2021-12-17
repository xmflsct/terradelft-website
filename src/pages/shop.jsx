import GridObjectOnlineShop from '@components/grids/grid-object-online-shop'
import Layout from '@components/layout'
import { graphql } from 'gatsby'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import PropTypes from 'prop-types'
import React from 'react'

const PageShop = ({ data }) => {
  const { t } = useTranslation()

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      SEOdescription={t('name')}
      containerName='static-online-shop'
    >
      <GridObjectOnlineShop nodes={data.objects.nodes} />
    </Layout>
  )
}

PageShop.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query PageShop($language: String!) {
    locales: allLocale(
      filter: {
        ns: { in: ["translation", "page-shop", "component-object"] }
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
        sellOnline: { eq: true }
        node_locale: { eq: $language }
        stock: { ne: 0 }
      }
    ) {
      nodes {
        ...ObjectOnlineShop
      }
    }
  }
`

export default PageShop
