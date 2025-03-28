import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import {
  data as loaderData,
  LoaderFunctionArgs,
  MetaFunction,
  useLoaderData,
  useParams
} from 'react-router'
import { H1 } from '~/components/globals'
import ListObjects, { LIST_OBJECT_DETAILS } from '~/components/list/objects'
import Pagination from '~/components/pagination'
import i18next from '~/i18next.server'
import cache from '~/utils/cache'
import { graphqlRequest, ObjectsObject } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const page = parseInt(args.params.page || '')
  if (page < 1) {
    throw loaderData(null, { status: 404 })
  }

  const en = await i18next.getFixedT('en', 'object')
  const nl = await i18next.getFixedT('nl', 'object')
  const technique = [en('technique').toLowerCase(), nl('technique').toLowerCase()]
  const material = [en('material').toLowerCase(), nl('material').toLowerCase()]
  const perPage = 48

  let data
  switch (args.params.type) {
    case technique[0]:
    case technique[1]:
      data = await cache<{
        type: {
          linkedFrom: {
            objectsObjectCollection: { total: number; items: ObjectsObject[] }
          }
        }
      }>({
        ...args,
        req: graphqlRequest({
          ...args,
          variables: {
            id: args.params.id,
            limit: perPage,
            skip: perPage * (page - 1)
          },
          query: gql`
            ${LIST_OBJECT_DETAILS}
            query PageObjectAttributeTechnique(
              $preview: Boolean
              $locale: String
              $id: String!
              $limit: Int
              $skip: Int
            ) {
              type: objectsTechnique(preview: $preview, locale: $locale, id: $id) {
                linkedFrom {
                  objectsObjectCollection(locale: "nl", limit: $limit, skip: $skip) {
                    total
                    items {
                      ...ListObjectDetails
                    }
                  }
                }
              }
            }
          `
        })
      })
      break
    case material[0]:
    case material[1]:
      data = await cache<{
        type: {
          linkedFrom: {
            objectsObjectCollection: { total: number; items: ObjectsObject[] }
          }
        }
      }>({
        ...args,
        req: graphqlRequest({
          ...args,
          variables: {
            id: args.params.id,
            limit: perPage,
            skip: perPage * (page - 1)
          },
          query: gql`
            ${LIST_OBJECT_DETAILS}
            query PageObjectAttributeMaterial(
              $preview: Boolean
              $locale: String
              $id: String!
              $limit: Int
              $skip: Int
            ) {
              type: objectsMaterial(preview: $preview, locale: $locale, id: $id) {
                linkedFrom {
                  objectsObjectCollection(locale: "nl", limit: $limit, skip: $skip) {
                    total
                    items {
                      ...ListObjectDetails
                    }
                  }
                }
              }
            }
          `
        })
      })
      break
    default:
      throw loaderData(null, { status: 404 })
  }

  if (!data?.type?.linkedFrom?.objectsObjectCollection?.items?.length) {
    throw loaderData(null, { status: 404 })
  }

  const meta = await loadMeta(args, {
    titleKey: 'pages.objects-attribute',
    titleOptions: { type: args.params.type, value: args.params.value }
  })

  return {
    meta,
    data: {
      objects: data.type.linkedFrom.objectsObjectCollection.items,
      page: {
        total: Math.round(data?.type.linkedFrom.objectsObjectCollection.total / perPage),
        current: page
      }
    }
  }
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta && [
    ...linkHref(
      `object/${params.type}/${params.value}/${params.id}/page/${params.page}`,
      params.locale
    ),
    { title: SEOTitle(data.meta.title) },
    { name: 'keywords', content: SEOKeywords([data.meta.title]) }
  ]

const PageObjectAttribute: React.FC = () => {
  const {
    data: { objects, page }
  } = useLoaderData<typeof loader>()
  const params = useParams()

  const { t } = useTranslation('common')

  return (
    <>
      <H1>{t('pages.objects-attribute', params)}</H1>
      <ListObjects objects={objects} />

      <Pagination
        basePath={`/object/${params.type?.toLowerCase()}/${params.value?.toLowerCase()}/${
          params.id
        }/page`}
        total={page.total}
        page={page.current}
      />
    </>
  )
}

export default PageObjectAttribute
