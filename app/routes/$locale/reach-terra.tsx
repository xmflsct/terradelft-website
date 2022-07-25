import { gql, QueryOptions } from '@apollo/client'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import RichText from '~/components/richText'
import { cacheQuery, ReachTerra, richTextLinks } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: { page: ReachTerra }
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string }> = {
    variables: { locale: props.params.locale! },
    query: gql`
      query Index($locale: String) {
        page: informationReachTerra ( locale: $locale, id: "7Hr9VIqrByJWQpkMVgxwN6" ) {
          description {
            json
            ${richTextLinks}
          }
        }
      }
    `
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, { titleKey: 'pages.reach-terra' })

  return json({ meta, data })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    ...(data?.data?.page?.description?.json && {
      description: documentToPlainTextString(
        data.data.page.description.json
      ).substring(0, 199)
    })
  }

const PageReachTerra = () => {
  const {
    data: { page }
  } = useLoaderData<Data>()

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <div>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2455.7534580179854!2d4.354894416068296!3d52.01137027972119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b5c3951554ed%3A0x4210dea3a13c91b5!2sGalerie%20Terra%20Delft!5e0!3m2!1sen!2sse!4v1588255098658!5m2!1sen!2sse'
              title='Google Maps'
              frameBorder='0'
              allowFullScreen
              className='w-full'
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
