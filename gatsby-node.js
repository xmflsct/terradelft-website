const realFs = require("fs")
const gracefulFs = require("graceful-fs")
gracefulFs.gracefulify(realFs)
const _ = require("lodash")
const path = require(`path`)
const slugify = require("slugify")
const i18next = require("i18next")
const nodeFsBackend = require("i18next-node-fs-backend")

const languages = ["nl", "en"]

exports.createPages = async ({
  graphql,
  actions: { createPage, createRedirect },
}) => {
  createPage({
    path: "/",
    component: path.resolve(`src/templates/static-landing.jsx`),
    context: {},
  })
  await buildStaticPages(["static-index", "constant"], createPage)
  await buildStaticPages(
    ["static-online-shop", "constant", "component-object"],
    createPage
  )
  await buildStaticPages(
    ["static-bag", "constant", "component-object"],
    createPage
  )
  await buildStaticPages(["static-404", "constant"], createPage)

  /* Biuld Artist Page */
  const pageArtist = path.resolve(`src/templates/dynamic-artist.jsx`)
  const artists = await graphql(`
    {
      artists: allContentfulObjectsArtist(
        filter: { node_locale: { eq: "nl" } }
      ) {
        edges {
          node {
            contentful_id
            artist
          }
        }
      }
    }
  `)
  await Promise.all(
    artists.data.artists.edges.map(async (node) => {
      const artistsNew = await graphql(
        `
          query($contentful_id: String!) {
            artistsNew: allContentfulObjectsArtist(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              edges {
                node {
                  contentful_id
                  node_locale
                  artist
                }
              }
            }
          }
        `,
        { contentful_id: node.node.contentful_id }
      )
      await buildDynamicPages(
        artistsNew.data.artistsNew.edges,
        ({ node }, language) => ({
          path: `/${language}/${slugify(node.artist, { lower: true })}`,
          component: pageArtist,
          context: { contentful_id: node.contentful_id, language: language },
        }),
        ["constant"],
        createPage
      )
    })
  )

  /* Biuld Object Page */
  const object = path.resolve(`src/templates/dynamic-object.jsx`)
  const objects = await graphql(`
    {
      objects: allContentfulObjectsObjectMain(
        filter: { node_locale: { eq: "nl" } }
      ) {
        edges {
          node {
            contentful_id
            name
          }
        }
      }
    }
  `)
  await Promise.all(
    objects.data.objects.edges.map(async (node) => {
      const objectsNew = await graphql(
        `
          query($contentful_id: String!) {
            objectsNew: allContentfulObjectsObjectMain(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              edges {
                node {
                  contentful_id
                  node_locale
                  name
                  artist {
                    contentful_id
                    artist
                  }
                  description {
                    json
                  }
                }
              }
            }
          }
        `,
        { contentful_id: node.node.contentful_id }
      )
      await buildDynamicPages(
        objectsNew.data.objectsNew.edges,
        ({ node }, language) => ({
          path: `/${language}/${slugify(node.artist.artist, {
            lower: true,
          })}/${slugify(`${node.name}-${node.contentful_id}`, {
            lower: true,
          })}`,
          component: object,
          context: {
            contentful_id: node.contentful_id,
            artist_contentful_id: node.artist.contentful_id,
            language: language,
            imagesFromRichText: node.description
              ? getImagesFromRichText(node.description.json.content)
              : ["null"],
          },
        }),
        ["constant", "dynamic-object", "component-object"],
        createPage
      )
    })
  )

  /* Redirect - 404 */
  languages.forEach((language) =>
    createRedirect({
      fromPath: `/${language}/*`,
      toPath: `/${language}/404`,
      statusCode: 404,
    })
  )
  createRedirect({ fromPath: "/*", toPath: "/404", statusCode: 404 })
}

const createI18nextInstance = async (language, namespaces) => {
  const i18n = i18next.createInstance()
  i18n.use(nodeFsBackend)
  await new Promise((resolve) =>
    i18n.init(
      {
        lng: language,
        ns: namespaces,
        fallbackLng: language,
        interpolation: { escapeValue: false },
        backend: { loadPath: `src/locales/{{lng}}/{{ns}}.json` },
      },
      resolve
    )
  )
  return i18n
}

const buildStaticPages = async (namespaces, createPage) => {
  const definitions = await Promise.all(
    languages.map(async (language) => {
      const i18n = await createI18nextInstance(language, namespaces)
      const res = {
        path: `/${language}/${i18n.t(`${namespaces[0]}:url`)}`,
        component: path.resolve(`src/templates/${namespaces[0]}.jsx`),
        context: {
          language: language,
          i18nResources: i18n.services.resourceStore.data,
        },
      }
      return res
    })
  )
  const alternateLinks = await Promise.all(
    definitions.map((d) => ({
      language: d.context.language,
      path: d.path,
    }))
  )

  await Promise.all(
    definitions.map((d) => {
      d.context.alternateLinks = alternateLinks
      createPage(d)
    })
  )
}

const buildDynamicPages = async (
  dataRaw,
  pageDefinitionCallback,
  namespaces,
  createPage
) => {
  const definitions = await Promise.all(
    dataRaw.map(async (data) => {
      const language = data.node.node_locale
      const i18n = await createI18nextInstance(language, namespaces)
      const res = pageDefinitionCallback(data, language, i18n)
      res.context.language = language
      res.context.i18nResources = i18n.services.resourceStore.data
      return res
    })
  )
  const alternateLinks = await Promise.all(
    definitions.map((d) => ({
      language: d.context.language,
      path: d.path,
    }))
  )

  await Promise.all(
    definitions.map((d) => {
      d.context.alternateLinks = alternateLinks
      createPage(d)
    })
  )
}

const getImagesFromRichText = (content) => {
  return (
    content &&
    content.reduce((acc, c) => {
      const contentful_id = _.get(c, "data.target.sys.contentful_id")
      if (c.nodeType == "embedded-asset-block" && contentful_id) {
        return [...acc, contentful_id]
      }
      return acc
    }, [])
  )
}

// Add a node for sorting artist by last name
exports.onCreateNode = ({ actions, getNode, node }) => {
  if (node.internal.owner !== "gatsby-source-contentful") {
    return
  }
  const { createNodeField } = actions
  switch (node.internal.type) {
    // For sorting by artists' last name
    case "ContentfulObjectsArtist":
      createNodeField({
        node,
        name: "artist_lastname",
        value: node.artist.split(" ")[node.artist.split(" ").length - 1],
      })
      break
    // For adding fields to main object, such as variations' discounts
    case "ContentfulObjectsObjectMain":
      if (node.variations___NODE) {
        let sale = false
        let variants = []
        let priceRange = {
          lowest: 99999,
          highest: 0,
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
          name: "object_sale",
          value: sale,
        })
        createNodeField({
          node,
          name: "object_variants",
          value: variants,
        })
        createNodeField({
          node,
          name: "variations_price_range",
          value: priceRange,
        })
      } else {
        if (node.priceSale) {
          createNodeField({
            node,
            name: "object_sale",
            value: true,
          })
        } else {
          createNodeField({
            node,
            name: "object_sale",
            value: false,
          })
        }
      }
      break
  }
}
