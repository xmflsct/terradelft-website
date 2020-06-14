import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useLocation } from '@reach/router'
import queryString from 'query-string'

import Layout from '../layouts/layout'

const StaticSearch = ({ pageContext }) => {
  const { t } = useTranslation('static-search')
  const params = queryString.parse(useLocation().search)
  const variableCSE = {
    nl: '011045817426374110910:o5c3nbazgrk',
    en: '011045817426374110910:ih4lkw2wwrq'
  }

  return (
    <>
      <Helmet>
        <script
          async
          src={`https://cse.google.com/cse.js?cx=${
            variableCSE[pageContext.locale]
          }`}
        />
      </Helmet>
      <Layout
        SEOtitle={t('name')}
        SEOkeywords={[t('name'), 'Terra', 'Delft', 'Terra Delft']}
        SEOdescription={t('name')}
        containerName='static-search'
      >
        <h1>
          {t('content.heading', {
            query: params.query
          })}
        </h1>
        <div className='gcse-searchresults-only' />
      </Layout>
    </>
  )
}

StaticSearch.propTypes = {
  pageContext: PropTypes.object.isRequired
}

export default StaticSearch
