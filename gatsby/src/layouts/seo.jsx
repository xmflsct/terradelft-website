import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useStaticQuery, graphql } from 'gatsby'

function Seo ({ title, keywords, description, schema }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  const { i18n } = useTranslation()
  return (
    <Helmet title={title} titleTemplate={`%s | ${site.siteMetadata.title}`}>
      <html lang={i18n.language} />
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords.join(', ')} />}
      <meta name='og:title' content={title} />
      <meta name='og:description' content={description} />
      <meta name='og:type' content='website' />
      {schema && (
        <script type='application/ld+json'>{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}

Seo.propTypes = {
  title: PropTypes.string.isRequired,
  keywords: PropTypes.arrayOf(PropTypes.string),
  description: PropTypes.string.isRequired,
  schema: PropTypes.object
}

export default Seo
