import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import type { Article, WithContext } from 'schema-dts'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { cacheQuery, NewsNews, RICH_TEXT_LINKS } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderArgs) => {
  const data = await cacheQuery<{
    news: Omit<NewsNews, 'sys' | 'terraInChina'>
  }>({
    ...args,
    variables: { id: args.params.id },
    query: gql`
      query PageNews($locale: String, $id: String!) {
        news: newsNews (locale: $locale, id: $id) {
          title
          date
          image {
            url
            description
          }
          content {
            json
            ${RICH_TEXT_LINKS}
          }
        }
      }
    `
  })

  if (!data?.news) {
    throw json('Not Found', { status: 404 })
  }
  return json(data)
}

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData<typeof loader>
}) => ({
  title: SEOTitle(data.news.title),
  keywords: SEOKeywords([data.news.title]),
  ...(data.news.content && {
    description: documentToPlainTextString(data.news.content.json).substring(
      0,
      199
    )
  })
})
export const handle = {
  structuredData: ({
    news
  }: LoaderData<typeof loader>): WithContext<Article> => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: news.title,
    datePublished: news.date,
    ...(news.image && { image: news.image.url }),
    articleBody: news.content && documentToPlainTextString(news.content.json)
  })
}

const PageNews = () => {
  const { news } = useLoaderData<typeof loader>()
  const { t, i18n } = useTranslation('news')

  return (
    <div className='grid grid-cols-6 gap-4'>
      <H1 className={news.image ? 'col-span-6' : 'col-span-4 col-start-2'}>
        {news.title}
      </H1>
      {news.image && (
        <ContentfulImage
          alt={news.title}
          image={news.image}
          width={309}
          quality={80}
          className='col-span-2'
        />
      )}
      <div className={news.image ? 'col-span-4' : 'col-span-4 col-start-2'}>
        <p>
          {t('published', {
            date: new Date(news.date).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          })}
        </p>
        <RichText content={news.content} className='mt-2' assetWidth={634} />
      </div>
    </div>
  )
}

export default PageNews
