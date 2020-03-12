const path = require(`path`)

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

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions

  deletePage(page)

  if (page.path == "/" || page.path == "/dev-404-page/") {
    createPage(page)
  }

  languages.map(value => {
    let newPath = `/${value}${page.path}`

    const localePage = {
      ...page,
      originalPath: page.path,
      path: newPath,
      context: {
        locale: value,
        routed: true,
        originalPath: page.path,
      },
    }
    createPage(localePage)
  })
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const artistTemplate = path.resolve(`src/templates/artist.jsx`)
  const objectTemplate = path.resolve(`src/templates/object.jsx`)

  return graphql(
    `
      {
        artists: allContentfulObjectsArtist {
          edges {
            node {
              id
              artist
              node_locale
            }
          }
        }
        objects: allContentfulObjectsObject {
          edges {
            node {
              id
              slug
              node_locale
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    result.data.artists.edges.forEach(edge => {
      const { id, artist, node_locale } = edge.node
      const path = node_locale + "/" + slugify(artist)
      createPage({
        path: path,
        component: artistTemplate,
        context: {
          id: id,
        },
      })
    })

    result.data.objects.edges.forEach(edge => {
      const { id, slug, node_locale } = edge.node
      const path = node_locale + "/" + slugify(slug)
      createPage({
        path: path,
        component: objectTemplate,
        context: {
          id: id,
        },
      })
    })
  })
}
