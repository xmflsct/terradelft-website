import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useStaticQuery, graphql } from 'gatsby'

function Seo ({ title, keywords, description }) {
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
    <Helmet
      htmlAttributes={{ lang: i18n.language }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: 'description',
          content: description
        },
        {
          property: 'og:title',
          content: title
        },
        {
          property: 'og:description',
          content: description
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'keywords',
          content: keywords.join(', ')
        }
      ]}
    />
  )
}

Seo.propTypes = {
  title: PropTypes.string.isRequired,
  keywords: PropTypes.arrayOf(PropTypes.string),
  description: PropTypes.string
}

export default Seo
