import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { data as loaderData, LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import type { Article, WithContext } from 'schema-dts'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import { graphqlRequest, NewsNews, RICH_TEXT_LINKS } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const data = await cache<{
    news: Omit<NewsNews, 'sys' | 'terraInChina'>
  }>({
    ttlMinutes: 10080,
    ...args,
    req: graphqlRequest({
      ...args,
      variables: { id: args.params.id },
      query: gql`
        query PageNews($preview: Boolean, $locale: String, $id: String!) {
          news: newsNews(preview: $preview, locale: $locale, id: $id) {
            title
            date
            image {
              url
              title
              width
              height
            }
            content {
              json
              ${RICH_TEXT_LINKS}
            }
          }
        }
      `
    })
  })

  if (!data?.news) {
    throw loaderData(null, { status: 404 })
  }
  return data
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.news
    ? [
        ...linkHref(`news/${params.id}`, params.locale),
        { title: SEOTitle(data.news.title) },
        {
          property: 'og:title',
          content: SEOTitle(data.news.title)
        },
        ...(data.news.image
          ? [
              {
                property: 'og:image',
                content: data.news.image
              }
            ]
          : []),
        { name: 'keywords', content: SEOKeywords([data.news.title]) },
        data.news.content
          ? {
              name: 'description',
              content: documentToPlainTextString(data.news.content.json).substring(0, 199)
            }
          : {}
      ]
    : []
export const handle = {
  structuredData: ({ news }: LoaderData<typeof loader>): WithContext<Article> => ({
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
    <div className='grid grid-cols-6 gap-4 items-start'>
      <H1 className={news.image ? 'col-span-6' : 'col-span-6 lg:col-span-4 lg:col-start-2'}>
        {news.title}
      </H1>
      {news.image && (
        <ContentfulImage
          alt={news.title}
          image={news.image}
          width={309}
          quality={80}
          className='col-span-6 lg:col-span-2'
          zoomable
        />
      )}
      <div
        className={
          news.image ? 'col-span-6 lg:col-span-4' : 'col-span-6 lg:col-span-4 lg:col-start-2'
        }
      >
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
