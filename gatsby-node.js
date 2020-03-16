const fs = require("fs")
const path = require(`path`)
const slugify = require("slugify")
const i18next = require("i18next")
const nodeFsBackend = require("i18next-node-fs-backend")

const languages = ["nl", "en"]
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const srcPath = resolveApp("src")

exports.createPages = async ({
  graphql,
  actions: { createPage, createRedirect },
}) => {
  await buildIndexPages(createPage)
  await build404Pages(createPage)

  /* Biuld Artist Page */
  const pageArtist = path.resolve(`src/templates/pageArtist.jsx`)
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
    artists.data.artists.edges
      .filter(placeholder => placeholder.node.artist !== "PLACEHOLDER")
      .map(async result => {
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
          { contentful_id: result.node.contentful_id }
        )
        await buildI18nPages(
          artistsNew.data.artistsNew.edges,
          ({ node }, language) => ({
            path: "/" + language + "/" + slugify(node.artist, { lower: true }),
            component: pageArtist,
            context: { contentful_id: node.contentful_id, language: language },
          }),
          ["common"],
          createPage
        )
      })
  )

  /* Biuld Object Page */
  const pageObject = path.resolve(`src/templates/pageObject.jsx`)
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
    objects.data.objects.edges
      .filter(placeholder => placeholder.node.name !== "PLACEHOLDER")
      .map(async result => {
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
                  }
                }
              }
            }
          `,
          { contentful_id: result.node.contentful_id }
        )
        await buildI18nPages(
          objectsNew.data.objectsNew.edges,
          ({ node }, language) => ({
            path:
              "/" +
              language +
              "/" +
              slugify(node.artist.artist, { lower: true }) +
              "/" +
              slugify(node.name, { lower: true }),
            component: pageObject,
            context: {
              contentful_id: node.contentful_id,
              artist_contentful_id: node.artist.contentful_id,
              language: language,
            },
          }),
          ["common", "pageObject"],
          createPage
        )
      })
  )

  /* Redirect - Index */
  createRedirect({ fromPath: "/", toPath: "/nl", isPermanent: true })

  /* Redirect - 404 */
  languages.forEach(language =>
    createRedirect({
      fromPath: `/${language}/*`,
      toPath: `/${language}/404`,
      statusCode: 404,
    })
  )
  createRedirect({ fromPath: "/*", toPath: "/404", statusCode: 404 })
}

const buildI18nPages = async (
  dataRaw,
  pageDefinitionCallback,
  namespaces,
  createPage
) => {
  if (!Array.isArray(dataRaw)) dataRaw = [dataRaw]
  const definitions = await Promise.all(
    dataRaw.map(async data => {
      const language = data.node.node_locale
      const i18n = await createI18nextInstance(language, namespaces)
      const res = pageDefinitionCallback(data, language, i18n)
      res.context.language = language
      res.context.i18nResources = i18n.services.resourceStore.data
      return res
    })
  )
  const alternateLinks = await Promise.all(
    definitions.map(d => ({
      language: d.context.language,
      path: d.path,
    }))
  )

  await Promise.all(
    definitions.map(d => {
      d.context.alternateLinks = alternateLinks
      createPage(d)
    })
  )
}

const createI18nextInstance = async (language, namespaces) => {
  const i18n = i18next.createInstance()
  i18n.use(nodeFsBackend)
  await new Promise(resolve =>
    i18n.init(
      {
        lng: language,
        ns: namespaces,
        fallbackLng: language,
        interpolation: { escapeValue: false },
        backend: { loadPath: `${srcPath}/locales/{{lng}}/{{ns}}.json` },
      },
      resolve
    )
  )
  return i18n
}

const buildIndexPages = async createPage => {
  const indexTemplate = path.resolve(`src/templates/index.jsx`)
  await Promise.all(
    languages.map(async language => {
      const i18n = await createI18nextInstance(language, ["common", "index"])
      const res = {
        path: "/" + language,
        component: indexTemplate,
        context: {},
      }
      res.context.language = language
      res.context.i18nResources = i18n.services.resourceStore.data
      await Promise.all(
        (res.context.alternateLinks = languages.map(lang => ({
          language: lang,
          path: "/" + lang,
        })))
      )
      createPage(res)
    })
  )
}

const build404Pages = async createPage => {
  const errorTemplate = path.resolve(`src/templates/404.jsx`)
  await Promise.all(
    languages.map(async (language, index) => {
      const i18n = await createI18nextInstance(language, ["404"])
      const res = {
        path: "/" + language + "/404",
        component: errorTemplate,
        context: {},
      }
      res.context.language = language
      res.context.i18nResources = i18n.services.resourceStore.data
      createPage(res)
      if (index === 0) {
        res.path = "/404"
        createPage(res)
      }
    })
  )
}
