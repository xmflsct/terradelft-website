import {
  faCalendarDays,
  faNewspaper,
  faPalette,
  faUser,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import cache from '~/utils/cache'
import classNames from '~/utils/classNames'
import loadMeta from '~/utils/loadMeta'
import { SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

type HighlightResult = {
  fullyHighlighted: boolean
  matchLevel: 'none' | 'partial' | 'full'
  matchedWords: string[]
  value: string
}
type SearchArtist = {
  __type: 'artist'
  slug: string
  name: string
  avatar: string
  biography?: string
  _highlightResult: {
    [key in keyof Omit<SearchArtist, '_highlightResult'>]: HighlightResult
  }
}
type SearchObject = {
  __type: 'object'
  id: string
  name: string
  description?: string
  image?: string
  artist: string
  sku?: string
  variations?: {
    sku?: string
    variant?: string
    colour?: string
    size?: string
  }[]
  year?: number
  techniques?: string[]
  materials?: string[]
  _highlightResult: {
    [key in keyof Omit<SearchObject, '_highlightResult'>]: HighlightResult
  }
}
type SearchEvent = {
  __type: 'event'
  id: string
  name: string
  image?: string
  description?: string
  _highlightResult: {
    [key in keyof Omit<SearchEvent, '_highlightResult'>]: HighlightResult
  }
}
type SearchNews = {
  __type: 'news'
  id: string
  title: string
  image?: string
  content?: string
  _highlightResult: {
    [key in keyof Omit<SearchNews, '_highlightResult'>]: HighlightResult
  }
}

export const loader = async (args: LoaderArgs) => {
  const query = new URL(args.request.url).searchParams.get('query')
  if (!query)
    return json({
      meta: { title: '' },
      data: {
        hits: [],
        hitsPerPage: 0,
        nbHits: 0,
        nbPages: 0,
        query: null
      }
    })

  const url = new URL(
    `https://${args.context.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${args.params.locale}`
  )
  const params = new URLSearchParams()
  params.append('query', query)
  url.search = params.toString()
  const data = await cache<{
    hits: (SearchArtist | SearchObject | SearchEvent | SearchNews)[]
    hitsPerPage: number
    nbHits: number
    nbPages: number
    page: number
    processingTimeMS: number
    query: string
  }>({
    ...args,
    req: async () =>
      (
        await fetch(url, {
          headers: {
            'X-Algolia-Application-Id': args.context.ALGOLIA_APP_ID as string,
            'X-Algolia-API-Key': args.context.ALGOLIA_API_KEY as string
          }
        })
      ).json()
  })
  const meta = await loadMeta(args, {
    titleKey: 'pages.search',
    titleOptions: { query: data.query }
  })

  return json({ meta, data })
}

export const meta: MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title)
  }
export let handle = { i18n: 'search' }

const PageSearch: React.FC = () => {
  const { data } = useLoaderData<typeof loader>()
  const { t } = useTranslation('search')

  if (!data.query) {
    return null
  }

  const result = ({
    to,
    type,
    heading,
    content,
    image
  }: {
    to: string
    type: IconDefinition
    heading?: string
    content?: string
    image?: string
  }) => {
    if (!heading) return null
    return (
      <>
        <div className='basis-4/5 lg:basis-5/6'>
          <div className='flex flex-row gap-2 items-center'>
            <FontAwesomeIcon icon={type} className='text-stone-600' size='sm' />
            <Link
              className='text-lg lg:text-xl line-clamp-1 lg:line-clamp-2'
              to={to}
              children={
                <span
                  dangerouslySetInnerHTML={{ __html: heading }}
                  className={`[&>em]:not-italic [&>em]:font-bold`}
                />
              }
            />
          </div>
          {content ? (
            <p
              dangerouslySetInnerHTML={{ __html: content }}
              className={classNames(
                'mt-1 lg:mt-2',
                'line-clamp-2 lg:line-clamp-3',
                'text-sm lg:text-base',
                `[&>em]:not-italic [&>em]:font-bold`
              )}
            />
          ) : null}
        </div>
        {image ? (
          <div className='basis-1/5 lg:basis-1/6'>
            <ContentfulImage
              image={{ url: image, title: 'Search image' }}
              width={157}
              height={157}
              quality={80}
              behaviour='fill'
              focusArea='faces'
            />
          </div>
        ) : null}
      </>
    )
  }
  const renderHitResult = (hit: SearchArtist | SearchObject | SearchEvent | SearchNews) => {
    switch (hit.__type) {
      case 'artist':
        return result({
          to: `/artist/${hit.slug}`,
          type: faUser,
          heading: hit._highlightResult.name.value,
          content: hit._highlightResult.biography?.value,
          image: hit.avatar
        })
      case 'object':
        if (!hit.artist) return null
        return result({
          to: `/object/${hit.id}`,
          type: faPalette,
          heading: `${hit._highlightResult.name.value} by ${hit.artist}`,
          content: hit._highlightResult.description?.value,
          image: hit.image
        })
      case 'event':
        return result({
          to: `/exhibition/${hit.id}`,
          type: faCalendarDays,
          heading: hit._highlightResult.name.value,
          content: hit._highlightResult.description?.value,
          image: hit.image
        })
      case 'news':
        return result({
          to: `/news/${hit.id}`,
          type: faNewspaper,
          heading: hit._highlightResult.title.value,
          content: hit._highlightResult.content?.value,
          image: hit.image
        })
      default:
        return null
    }
  }

  return (
    <>
      <H1>{t('heading', { query: data.query })}</H1>
      <div className='text-sm text-stone-500 mb-4'>
        {t('summary', {
          total: data.nbHits,
          count: data.nbHits < data.hitsPerPage ? data.nbHits : data.hitsPerPage
        })}
      </div>
      <div className='flex flex-col gap-4'>
        {data.hits.map((hit, index) => (
          <div key={index} className='flex flex-row gap-4'>
            {renderHitResult(hit)}
          </div>
        ))}
      </div>
    </>
  )
}

export default PageSearch
