const fs = require("fs")
const path = require(`path`)
const i18next = require("i18next")
const nodeFsBackend = require("i18next-node-fs-backend")

function slugify(string) {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;"
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------"
  const p = new RegExp(a.split("").join("|"), "g")
  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

const languages = ["nl", "en"]
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const srcPath = resolveApp("src")

exports.createPages = async ({
  graphql,
  actions: { createPage, createRedirect },
}) => {
  /* Biuld Homepage */
  const indexTemplate = path.resolve(`src/templates/index.jsx`)
  await buildI18nPages(
    null,
    (_, language) => ({
      path: "/" + language,
      component: indexTemplate,
      context: {},
    }),
    ["common", "home"],
    createPage
  )

  /* Biuld Artist Page */
  const artistTemplate = path.resolve(`src/templates/artist.jsx`)
  const artists = await graphql(`
    {
      artists: allContentfulObjectsArtist {
        edges {
          node {
            contentful_id
            node_locale
            artist
          }
        }
      }
    }
  `)
  await buildI18nPages(
    artists.data.artists.edges,
    ({ node }, language) => ({
      path: `/${language}/${slugify(node.artist)}`,
      component: artistTemplate,
      context: { contentful_id: node.contentful_id, language: language },
    }),
    ["common"],
    createPage
  )

  /* Biuld Object Page */
  const objectTemplate = path.resolve(`src/templates/object.jsx`)
  const objects = await graphql(`
    {
      objects: allContentfulObjectsObject {
        edges {
          node {
            contentful_id
            node_locale
            name
            artist {
              artist
            }
          }
        }
      }
    }
  `)
  await buildI18nPages(
    objects.data.objects.edges,
    ({ node }, language) => ({
      path: `/${language}/${slugify(node.artist.artist)}/${slugify(node.name)}`,
      component: objectTemplate,
      context: { contentful_id: node.contentful_id, language: language },
    }),
    ["common"],
    createPage
  )

  /* Biuld 404 Page */
  await build404Pages(createPage)

  createRedirect({ fromPath: "/", toPath: "/nl", isPermanent: true })

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
  inputData,
  pageDefinitionCallback,
  namespaces,
  createPage
) => {
  if (!Array.isArray(inputData)) inputData = [inputData]
  await Promise.all(
    inputData.map(async ipt => {
      const definitions = await Promise.all(
        languages.map(async language => {
          const i18n = await createI18nextInstance(language, namespaces) // (1)
          const res = pageDefinitionCallback(ipt, language, i18n) // (2)
          res.context.language = language
          res.context.i18nResources = i18n.services.resourceStore.data // (3)
          return res
        })
      )

      const alternateLinks = definitions.map(d => ({
        // (4)
        language: d.context.language,
        path: d.path,
      }))

      definitions.forEach(d => {
        d.context.alternateLinks = alternateLinks
        createPage(d) // (5)
      })
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

// exports.createResolvers = ({ createResolvers }) => {
//   createResolvers({
//     SanityLocaleString: {
//       translate: {
//         type: `String!`,
//         args: { language: { type: "String" } },
//         resolve: (source, args) => {
//           return source[args.language] || source["en"]
//         },
//       },
//     },
//   })
// }

/* OLD */

// exports.createPages = ({ graphql, actions }) => {
//   const { createPage } = actions

//   const artistTemplate = path.resolve(`src/templates/artist.jsx`)
//   const objectTemplate = path.resolve(`src/templates/object.jsx`)

//   return graphql(
//     `
//       {
//         artists: allContentfulObjectsArtist {
//           edges {
//             node {
//               id
//               artist
//               node_locale
//             }
//           }
//         }
//         objects: allContentfulObjectsObject {
//           edges {
//             node {
//               id
//               slug
//               node_locale
//             }
//           }
//         }
//       }
//     `
//   ).then(result => {
//     if (result.errors) {
//       throw result.errors
//     }

//     result.data.artists.edges.forEach(edge => {
//       const { id, artist, node_locale } = edge.node
//       const path = node_locale + "/" + slugify(artist)
//       createPage({
//         path: path,
//         component: artistTemplate,
//         context: {
//           id: id,
//         },
//       })
//     })

//     result.data.objects.edges.forEach(edge => {
//       const { id, slug, node_locale } = edge.node
//       const path = node_locale + "/" + slugify(slug)
//       createPage({
//         path: path,
//         component: objectTemplate,
//         context: {
//           id: id,
//         },
//       })
//     })
//   })
// }
