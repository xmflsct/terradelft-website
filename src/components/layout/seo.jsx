import { useStaticQuery, graphql } from 'gatsby'
import { Helmet } from 'gatsby-plugin-react-i18next'
import React from 'react'

function Seo({ title, keywords, description, schema }) {
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

  return (
    <Helmet title={title} titleTemplate={`%s | ${site.siteMetadata.title}`}>
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

export default Seo
