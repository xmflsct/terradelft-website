module.exports = {
  siteMetadata: {
    title: `Terra Delft`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@xmflsct`,
  },
  plugins: [
    `gatsby-plugin-lodash`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-plugin-sass",
      options: {
        precision: 6,
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: '6ismla9y1rua',
        accessToken: 'opqa3D0461_GkR7THrqZtL8OoKXWI5BhxtfEX7EW9z8',
        host: 'preview.contentful.com'
        // spaceId: process.env.CONTENTFUL_SPACEID,
        // accessToken: process.env.CONTENTFUL_ACCESSTOKEN
        // host: process.env.CONTENTFUL_HOST,
        // environment: `master`,
        // downloadLocal: true
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
  ],
}
