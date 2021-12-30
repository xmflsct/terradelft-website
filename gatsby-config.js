require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: 'Terra Delft',
    siteUrl: 'https://www.terra-delft.nl'
  },
  plugins: [
    // {
    //   resolve: '@sentry/gatsby',
    //   options: {
    //     dsn: process.env.GATSBY_SENTRY_DSN,
    //     enabled: process.env.NODE_ENV !== 'development',
    //     release: process.env.CF_PAGES_COMMIT_SHA
    //   }
    // },
    `gatsby-plugin-fontawesome-css`,
    `gatsby-plugin-image`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: `locales`,
        languages: ['nl', 'en'],
        defaultLanguage: 'nl',
        generateDefaultLanguagePage: true,
        siteUrl: 'https://www.terra-delft.nl',
        i18nextOptions: {
          interpolation: {
            escapeValue: false
          }
        },
        pages: [
          {
            matchPath: '/api/(.*)',
            excludeLanguages: ['en', 'nl']
          }
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        sassOptions: {
          includePaths: [require('path').resolve(__dirname, 'node_modules')],
          precision: 6
        }
      }
    },

    `gatsby-plugin-sharp`,
    {
      resolve: 'gatsby-source-contentful', // Space - Objects
      options: {
        host: process.env.CONTENTFUL_HOST,
        accessToken: process.env.CONTENTFUL_OBJECTS_KEY_GATSBY,
        spaceId: process.env.CONTENTFUL_OBJECTS_SPACE,
        environment: process.env.CONTENTFUL_OBJECTS_ENVIRONMENT
      }
    },
    {
      resolve: 'gatsby-source-contentful', // Space - Content
      options: {
        host: process.env.CONTENTFUL_HOST,
        accessToken: process.env.CONTENTFUL_CONTENTS_KEY,
        spaceId: process.env.CONTENTFUL_CONTENTS_SPACE,
        environment: process.env.CONTENTFUL_CONTENTS_ENVIRONMENT
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `locales`,
        path: `${__dirname}/src/locales`
      }
    },
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        exclude: ['/**/404', '/**/404.html'],
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage(filter: {context: {i18n: {routed: {eq: false}}}}) {
              edges {
                node {
                  context {
                    i18n {
                      defaultLanguage
                      languages
                      originalPath
                    }
                  }
                  path
                }
              }
            }
          }
        `,
        serialize: ({ site, allSitePage }) => {
          return allSitePage.edges.map(edge => {
            const { languages, originalPath, defaultLanguage } =
              edge.node.context.i18n
            const { siteUrl } = site.siteMetadata
            const url = siteUrl + originalPath
            const links = [
              { lang: defaultLanguage, url },
              { lang: 'x-default', url }
            ]
            languages.forEach(lang => {
              if (lang === defaultLanguage) return
              links.push({ lang, url: `${siteUrl}/${lang}${originalPath}` })
            })
            return {
              url,
              changefreq: 'daily',
              priority: originalPath === '/' ? 1.0 : 0.7,
              links
            }
          })
        }
      }
    }
  ]
}
