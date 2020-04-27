const realFs = require("fs")
const gracefulFs = require("graceful-fs")
gracefulFs.gracefulify(realFs)
const _ = require("lodash")
const path = require(`path`)
const slugify = require("slugify")
const i18next = require("i18next")
const nodeFsBackend = require("i18next-node-fs-backend")

// Default locale in first place
const locales = ["nl", "en"]

const allObjectAttributes = ["year", "technique", "material"]

exports.createPages = async ({
  graphql,
  actions: { createPage, createRedirect },
}) => {
  createPage({
    path: "/",
    component: path.resolve(`src/templates/static-landing.jsx`),
    context: {},
  })
  createPage({
    path: "/404",
    component: path.resolve(`src/templates/static-404.jsx`),
    context: {},
  })
  await buildStaticPages(["static-index", "constant"], createPage)
  await buildStaticPages(
    ["static-online-shop", "constant", "component-object"],
    createPage
  )
  await buildStaticPages(["static-events", "constant"], createPage)
  await buildStaticPages(
    ["static-bag", "constant", "component-object"],
    createPage
  )
  await buildStaticPages(["static-404", "constant"], createPage)

  /* Biuld Artist Page */
  const dynamicArtist = path.resolve(`src/templates/dynamic-artist.jsx`)
  const artists = await graphql(`
    {
      artists: allContentfulObjectsArtist(
        filter: { node_locale: { eq: "${locales[0]}" } }
      ) {
        nodes {
          contentful_id
          artist
        }
      }
    }
  `)
  await Promise.all(
    artists.data.artists.nodes.map(async (node) => {
      const artist = await graphql(
        `
          query($contentful_id: String!) {
            artist: allContentfulObjectsArtist(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              nodes {
                contentful_id
                node_locale
                artist
              }
            }
          }
        `,
        { contentful_id: node.contentful_id }
      )
      await buildDynamicPages(
        artist.data.artist.nodes,
        (language, { artist, contentful_id }) => ({
          path: `/${language}/${slugify(artist, { lower: true })}`,
          component: dynamicArtist,
          context: { contentful_id: contentful_id, language: language },
        }),
        ["constant"],
        createPage
      )
    })
  )

  /* Biuld Object Page */
  const dynamicObject = path.resolve(`src/templates/dynamic-object.jsx`)
  const objects = await graphql(`
    {
      objects: allContentfulObjectsObjectMain(
        filter: { node_locale: { eq: "${locales[0]}" } }
      ) {
        nodes {
          contentful_id
          name
        }
      }
    }
  `)
  await Promise.all(
    objects.data.objects.nodes.map(async (node) => {
      const object = await graphql(
        `
          query($contentful_id: String!) {
            object: allContentfulObjectsObjectMain(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              nodes {
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
        `,
        { contentful_id: node.contentful_id }
      )
      await buildDynamicPages(
        object.data.object.nodes,
        (language, { artist, name, contentful_id, description }) => ({
          path: `/${language}/${slugify(artist.artist, {
            lower: true,
          })}/${slugify(`${name}-${contentful_id}`, {
            lower: true,
          })}`,
          component: dynamicObject,
          context: {
            contentful_id: contentful_id,
            artist_contentful_id: artist.contentful_id,
            language: language,
            imagesFromRichText: description
              ? getImagesFromRichText(description.json.content)
              : ["null"],
          },
        }),
        ["constant", "dynamic-object", "component-object"],
        createPage
      )
    })
  )

  /* Biuld Object Attribute Page */
  const dynamicObjectAttribute = path.resolve(
    `src/templates/dynamic-object-attribute.jsx`
  )
  await Promise.all(
    allObjectAttributes.map(async (attribute) => {
      const objectAttributes = await graphql(`
      {
        objectAttributes: allContentfulObjects${
          attribute[0].toUpperCase() + attribute.slice(1)
        }(
          filter: { node_locale: { eq: "${locales[0]}" } }
        ) {
          nodes {
            contentful_id
            ${attribute}
          }
        }
      }
    `)
      await Promise.all(
        objectAttributes.data.objectAttributes.nodes.map(async (node) => {
          const objectAttribute = await graphql(
            `
              query($contentful_id: String!) {
                objectAttribute: allContentfulObjects${
                  attribute[0].toUpperCase() + attribute.slice(1)
                }(
                  filter: { contentful_id: { eq: $contentful_id } }
                ) {
                  nodes {
                    contentful_id
                    node_locale
                    ${attribute}
                  }
                }
              }
            `,
            { contentful_id: node.contentful_id }
          )
          objectAttribute.data.objectAttribute.nodes.length > 0 &&
            (await buildDynamicPages(
              objectAttribute.data.objectAttribute.nodes,
              (language, node, i18n) => ({
                path: `/${language}/objects/${slugify(
                  i18n.t(`component-object:${attribute}`),
                  { lower: true }
                )}/${slugify(node[attribute].toString(), { lower: true })}`,
                component: dynamicObjectAttribute,
                context: {
                  byYear: attribute === "year",
                  byTechnique: attribute === "technique",
                  byMaterial: attribute === "material",
                  attributeValue: node[attribute].toString(),
                  contentful_id: node.contentful_id,
                  language: language,
                },
              }),
              ["constant", "dynamic-object", "component-object"],
              createPage
            ))
        })
      )
    })
  )

  /* Redirect - 404 */
  locales.forEach((locale) =>
    createRedirect({
      fromPath: `/${locale}/*`,
      toPath: `/${locale}/404`,
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
    locales.map(async (locale) => {
      const i18n = await createI18nextInstance(locale, namespaces)
      const res = {
        path: `/${locale}/${i18n.t(`${namespaces[0]}:url`)}`,
        component: path.resolve(`src/templates/${namespaces[0]}.jsx`),
        context: {
          language: locale,
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
  nodes,
  pageDefinitionCallback,
  namespaces,
  createPage
) => {
  const definitions = await Promise.all(
    nodes.map(async (node) => {
      const language = node.node_locale
      const i18n = await createI18nextInstance(language, namespaces)
      const res = pageDefinitionCallback(language, node, i18n)
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

exports.createSchemaCustomization = ({ actions, schema }) => {
  // Custom date filter for events
  actions.createTypes([
    schema.buildObjectType({
      name: "ContentfulEventsEvent",
      interfaces: ["Node"],
      fields: {
        isCurrent: {
          type: "Boolean!",
          resolve: (source) =>
            new Date(source.datetimeEnd) >= new Date() &&
            new Date(source.datetimeStart) <= new Date(),
        },
        isFuture: {
          type: "Boolean!",
          resolve: (source) => new Date(source.datetimeStart) > new Date(),
        },
      },
    }),
  ])
}
