const path = require('path')

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@api': path.resolve(__dirname, 'src/api'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@state': path.resolve(__dirname, 'src/state'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    }
  })
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  // Custom date filter for events
  actions.createTypes([
    schema.buildObjectType({
      name: 'ContentfulEvent',
      interfaces: ['Node'],
      fields: {
        isCurrentAndFuture: {
          type: 'Boolean!',
          resolve: source => new Date(source.datetimeEnd) >= new Date()
        }
      }
    })
  ])
}

exports.onCreateNode = ({ actions, getNode, node }) => {
  if (node.internal.owner !== 'gatsby-source-contentful') {
    return
  }
  const { createNodeField } = actions
  switch (node.internal.type) {
    // For sorting by artists' last name
    case 'ContentfulObjectArtist':
      createNodeField({
        node,
        name: 'artist_lastname',
        value: node.artist.split(' ')[node.artist.split(' ').length - 1]
      })
      break
    // For adding fields to main object, such as variations' discounts
    case 'ContentfulObject':
      if (node.variations___NODE) {
        let sale = false
        const variants = []
        const priceRange = {
          lowest: 99999,
          highest: 0
        }
        for (const vNode of node.variations___NODE) {
          const variation = getNode(vNode)
          if (variation.sellOnline && variation.stock > 0) {
            variation.priceSale && (sale = true)

            if (variation.variant___NODE) {
              const variantName = getNode(variation.variant___NODE).variant
              !variants.includes(variantName) && variants.push(variantName)
            }

            const priceTemp = variation.priceSale || variation.priceOriginal
            priceTemp < priceRange.lowest && (priceRange.lowest = priceTemp)
            priceTemp > priceRange.highest && (priceRange.highest = priceTemp)
          }
        }

        createNodeField({
          node,
          name: 'object_sale',
          value: sale
        })
        createNodeField({
          node,
          name: 'object_variants',
          value: variants
        })
        createNodeField({
          node,
          name: 'variations_price_range',
          value: priceRange
        })
      } else {
        if (node.priceSale) {
          createNodeField({
            node,
            name: 'object_sale',
            value: true
          })
        } else {
          createNodeField({
            node,
            name: 'object_sale',
            value: false
          })
        }
      }
      break
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const totalNews = await graphql(`
    {
      newsTotal: allContentfulNews {
        totalCount
      }
    }
  `)
  const newsPerPage = 9
  const newsNumPages = Math.ceil(
    totalNews.data.newsTotal.totalCount / 2 / newsPerPage
  )
  Array.from({ length: newsNumPages }).forEach((_, i) => {
    createPage({
      path: `/news/page/${i + 1}`,
      component: path.resolve('./src/templates/news.jsx'),
      context: {
        limit: newsPerPage,
        skip: i * newsPerPage,
        numPages: newsNumPages,
        currentPage: i + 1
      }
    })
  })

  const archivedExhibitions = await graphql(`
    {
      archivedExhibitions: allContentfulEvent(
        filter: {
          type: {
            elemMatch: { contentful_id: { ne: "htJrQs69zz39hTCtUKiP0" } }
          }
        }
      ) {
        totalCount
      }
    }
  `)
  const exhibitionsPerPage = 9
  const exhibitionsNumPages = Math.ceil(
    archivedExhibitions.data.archivedExhibitions.totalCount /
      2 /
      exhibitionsPerPage
  )
  Array.from({ length: exhibitionsNumPages }).forEach((_, i) => {
    createPage({
      path: `/exhibitions/page/${i + 1}`,
      component: path.resolve('./src/templates/exhibitions.jsx'),
      context: {
        limit: newsPerPage,
        skip: i * newsPerPage,
        numPages: exhibitionsNumPages,
        currentPage: i + 1
      }
    })
  })
}
