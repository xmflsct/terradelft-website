import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { gql } from 'graphql-request'
import { LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import { graphqlRequest, ReachTerra, RICH_TEXT_LINKS } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const data = await cache<{ page: ReachTerra }>({
    ttlMinutes: 10080,
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageReachTerra($preview: Boolean, $locale: String) {
          page: informationReachTerra(
            preview: $preview
            locale: $locale
            id: "7Hr9VIqrByJWQpkMVgxwN6"
          ) {
            description {
              json
              ${RICH_TEXT_LINKS}
            }
          }
        }
      `
    })
  })
  const meta = await loadMeta(args, { titleKey: 'pages.reach-terra' })

  return { meta, data }
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta && [
    ...linkHref('reach-terra', params.locale),
    { title: SEOTitle(data.meta.title) },
    { name: 'keywords', content: SEOKeywords([data.meta.title]) },
    data?.data?.page?.description?.json
      ? {
          name: 'description',
          content: documentToPlainTextString(data.data.page.description.json).substring(0, 199)
        }
      : {}
  ]

const PageReachTerra = () => {
  const {
    data: { page }
  } = useLoaderData<typeof loader>()

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div>
          <div>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2455.7534580179854!2d4.354894416068296!3d52.01137027972119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b5c3951554ed%3A0x4210dea3a13c91b5!2sGalerie%20Terra%20Delft!5e0!3m2!1sen!2sse!4v1588255098658!5m2!1sen!2sse'
              title='Google Maps'
              frameBorder='0'
              allowFullScreen
              className='max-w-full'
            />
          </div>
        </div>
        <div>
          <RichText content={page.description} assetWidth={471} />
        </div>
      </div>
    </>
  )
}

export default PageReachTerra
