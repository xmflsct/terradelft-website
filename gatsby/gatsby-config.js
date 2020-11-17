require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: 'Terra Delft',
    siteUrl: 'https://terra-delft.nl'
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
        exclude: [
          '/en/search',
          '/nl/zoeken',
          '/en/shopping-bag',
          '/nl/winkelmandje',
          '/en/thank-you',
          '/nl/bedankt'
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Open Sans:400,600', 'Proza Libre:400']
        }
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
