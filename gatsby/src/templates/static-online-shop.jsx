import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { graphql } from 'gatsby'

import Layout from '../layouts/layout'
import GridObjectOnlineShop from '../components/grids/grid-object-online-shop'

const StaticOnlineShop = ({ data }) => {
  const { t } = useTranslation('static-online-shop')

  return (
    <Layout
      SEOtitle={t('name')}
      SEOkeywords={[t('name'), 'Terra Delft']}
      containerName='static-online-shop'
    >
      <GridObjectOnlineShop nodes={data.objects.nodes} />
    </Layout>
  )
}

StaticOnlineShop.propTypes = {
  data: PropTypes.object.isRequired
}

export const query = graphql`
  query staticOnlineShop($locale: String) {
    objects: allContentfulObject(
      filter: { sellOnline: { eq: true }, node_locale: { eq: $locale } }
    ) {
      nodes {
        ...ObjectOnlineShop
      }
    }
  }
`

export default StaticOnlineShop
