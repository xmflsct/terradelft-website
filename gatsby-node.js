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

const allObjectsAttributes = ["year", "technique", "material"]

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
  await buildStaticPages(
    ["static-events", "constant", "component-event"],
    createPage
  )
  await buildStaticPages(["static-news", "constant"], createPage)
  await buildStaticPages(["static-about-terra", "constant"], createPage)
  await buildStaticPages(["static-reach-terra", "constant"], createPage)
  await buildStaticPages(
    ["static-bag", "constant", "component-object"],
    createPage
  )
  await buildStaticPages(["static-404", "constant"], createPage)

  /* Biuld Artist Page */
  const templateDynamicArtist = path.resolve(`src/templates/dynamic-artist.jsx`)
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
        (locale, { artist, contentful_id }, i18n) => ({
          path: i18n.t("constant:slug.dynamic.artist.slug", {
            locale: locale,
            artist: artist,
          }),
          component: templateDynamicArtist,
          context: { contentful_id: contentful_id, locale: locale },
        }),
        ["constant"],
        createPage
      )
    })
  )

  /* Biuld Object Page */
  const templateDynamicObject = path.resolve(`src/templates/dynamic-object.jsx`)
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
        (locale, { artist, name, contentful_id, description }, i18n) => ({
          path: i18n.t("constant:slug.dynamic.object.slug", {
            locale: locale,
            artist: artist.artist,
            object: name,
            id: contentful_id,
          }),
          component: templateDynamicObject,
          context: {
            contentful_id: contentful_id,
            artist_contentful_id: artist.contentful_id,
            locale: locale,
            imagesFromRichText: description
              ? getImagesFromRichText(description.json.content)
              : [],
          },
        }),
        ["constant", "dynamic-object", "component-object"],
        createPage
      )
    })
  )

  /* Biuld Objects Attribute Page */
  const templateDynamicObjectsAttribute = path.resolve(
    `src/templates/dynamic-objects-attribute.jsx`
  )
  await Promise.all(
    allObjectsAttributes.map(async (attribute) => {
      const objectsAttributes = await graphql(`
      {
        objectsAttributes: allContentfulObjects${
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
        objectsAttributes.data.objectsAttributes.nodes.map(async (node) => {
          const objectsAttribute = await graphql(
            `
              query($contentful_id: String!) {
                objectsAttribute: allContentfulObjects${
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
          objectsAttribute.data.objectsAttribute.nodes.length > 0 &&
            (await buildDynamicPages(
              objectsAttribute.data.objectsAttribute.nodes,
              (locale, node, i18n) => ({
                path: i18n.t("constant:slug.dynamic.objects-attribute.slug", {
                  locale: locale,
                  type: i18n.t(`component-object:${attribute}`),
                  value: node[attribute].toString(),
                }),
                component: templateDynamicObjectsAttribute,
                context: {
                  byYear: attribute === "year",
                  byTechnique: attribute === "technique",
                  byMaterial: attribute === "material",
                  attributeValue: node[attribute].toString(),
                  contentful_id: node.contentful_id,
                  locale: locale,
                },
              }),
              ["constant", "dynamic-object", "component-object"],
              createPage
            ))
        })
      )
    })
  )

  /* Biuld Event Page */
  const templateDynamicEvent = path.resolve(`src/templates/dynamic-event.jsx`)
  const events = await graphql(`
      {
        events: allContentfulEventsEvent(
          filter: { node_locale: { eq: "${locales[0]}" } }
        ) {
          nodes {
            contentful_id
          }
        }
      }
    `)
  await Promise.all(
    events.data.events.nodes.map(async (node) => {
      const event = await graphql(
        `
          query($contentful_id: String!) {
            event: allContentfulEventsEvent(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              nodes {
                contentful_id
                node_locale
                name
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
        event.data.event.nodes,
        (locale, { name, contentful_id, description }, i18n) => ({
          path: i18n.t("constant:slug.dynamic.event.slug", {
            locale: locale,
            event: name,
            id: contentful_id,
          }),
          component: templateDynamicEvent,
          context: {
            contentful_id: contentful_id,
            locale: locale,
            imagesFromRichText: description
              ? getImagesFromRichText(description.json.content)
              : [],
          },
        }),
        ["constant", "static-events"],
        createPage
      )
    })
  )

  /* Biuld News Page */
  const templateDynamicNews = path.resolve(`src/templates/dynamic-news.jsx`)
  const news = await graphql(`
        {
          news: allContentfulNewsNews(
            filter: { node_locale: { eq: "${locales[0]}" } }
          ) {
            nodes {
              contentful_id
            }
          }
        }
      `)
  await Promise.all(
    news.data.news.nodes.map(async (node) => {
      const newsPiece = await graphql(
        `
          query($contentful_id: String!) {
            newsPiece: allContentfulNewsNews(
              filter: { contentful_id: { eq: $contentful_id } }
            ) {
              nodes {
                contentful_id
                node_locale
                title
                content {
                  json
                }
              }
            }
          }
        `,
        { contentful_id: node.contentful_id }
      )
      await buildDynamicPages(
        newsPiece.data.newsPiece.nodes,
        (locale, { title, contentful_id, content }, i18n) => ({
          path: i18n.t("constant:slug.dynamic.news.slug", {
            locale: locale,
            news: title,
            id: contentful_id,
          }),
          component: templateDynamicNews,
          context: {
            contentful_id: contentful_id,
            locale: locale,
            imagesFromRichText: content
              ? getImagesFromRichText(content.json.content)
              : [],
          },
        }),
        ["constant", "static-news"],
        createPage
      )
    })
  )

  /* Redirect - 404 */
  // locales.forEach((locale) =>
  //   createRedirect({
  //     fromPath: `/${locale}/*`,
  //     toPath: `/${locale}/404`,
  //     statusCode: 404,
  //   })
  // )
  // createRedirect({ fromPath: "/*", toPath: "/404", statusCode: 404 })
}

const createI18nextInstance = async (locale, namespaces) => {
  const i18n = i18next.createInstance()
  i18n.use(nodeFsBackend)
  await new Promise((resolve) =>
    i18n.init(
      {
        lng: locale,
        ns: namespaces,
        fallbackLng: locale,
        interpolation: {
          escapeValue: false,
          format: function (value, format) {
            if (format === "slugify") return slugify(value, { lower: true })
            return value
          },
        },
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
        path: i18n.t(`${namespaces[0]}:slug`, { locale: locale }),
        component: path.resolve(`src/templates/${namespaces[0]}.jsx`),
        context: {
          locale: locale,
          i18nResources: i18n.services.resourceStore.data,
        },
      }
      return res
    })
  )
  const alternateLinks = await Promise.all(
    definitions.map((d) => ({
      locale: d.context.locale,
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
      const locale = node.node_locale
      const i18n = await createI18nextInstance(locale, namespaces)
      const res = pageDefinitionCallback(locale, node, i18n)
      res.context.locale = locale
      res.context.i18nResources = i18n.services.resourceStore.data
      return res
    })
  )
  const alternateLinks = await Promise.all(
    definitions.map((d) => ({
      locale: d.context.locale,
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
