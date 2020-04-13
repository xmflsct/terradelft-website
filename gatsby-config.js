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
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `Open Sans`,
            variants: [`400`, `600`],
          },
          {
            family: `Proza Libre`,
            variants: [`400`],
          },
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-plugin-sass",
      options: {
        precision: 6,
        includePaths: [require("path").resolve(__dirname, "node_modules")],
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
