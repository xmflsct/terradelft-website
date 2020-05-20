require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: 'Terra Delft',
    author: '@xmflsct',
    siteUrl: 'https://terra-delft.nl',
    image: './static/favicon.png'
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-72011350-1',
        head: true,
        anonymize: true,
        respectDNT: true,
        pageTransitionDelay: 0
      }
    },
    {
      resolve: 'gatsby-plugin-layout',
      options: {
        component: require.resolve('./src/layouts/contexts/bag.jsx')
      }
    },
    'gatsby-plugin-lodash',
    {
      resolve: 'gatsby-plugin-prefetch-google-fonts',
      options: {
        fonts: [
          {
            family: 'Open Sans',
            variants: ['400', '600']
          },
          {
            family: 'Proza Libre',
            variants: ['400']
          }
        ]
      }
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-sass',
      options: {
        precision: 6,
        includePaths: [require('path').resolve(__dirname, 'node_modules')]
      }
    },
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        exclude: ['/en/thank-you', '/nl/bedankt']
      }
    },
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
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    },
    'gatsby-transformer-sharp'
  ]
}