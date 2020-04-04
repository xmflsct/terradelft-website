module.exports = {
  siteMetadata: {
    title: `Terra Delft`,
    description: `Terra Delft Website`,
    author: `@xmflsct`,
    siteUrl: "https://terra-delft.nl",
    image: "./static/favicon.png",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-layout",
      options: {
        component: require.resolve(`./src/layouts/contexts/bag.jsx`),
      },
    },
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
        host: process.env.CONTENTFUL_HOST,
        accessToken: process.env.CONTENTFUL_KEY_GATSBY,
        spaceId: process.env.CONTENTFUL_SPACE,
        environment: process.env.CONTENTFUL_ENVIRONMENT,
      },
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
