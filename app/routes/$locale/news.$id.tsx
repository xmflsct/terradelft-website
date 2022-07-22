import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import type { Article, WithContext } from 'schema-dts'
import { H1 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { getNewsNew, NewsNews } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props => {
  return await getNewsNew(props)
}

export const meta: MetaFunction = ({ data }: { data: NewsNews }) => ({
  title: SEOTitle(data.title),
  keywords: SEOKeywords([data.title]),
  ...(data.content && {
    description: documentToPlainTextString(data.content.json).substring(0, 199)
  })
})
export const handle = {
  structuredData: (data: NewsNews): WithContext<Article> => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: data.title,
    datePublished: data.date,
    ...(data.image && { image: data.image.url }),
    articleBody: data.content && documentToPlainTextString(data.content.json)
  })
}

const PageNews = () => {
  const newsNew = useLoaderData<NewsNews>()
  const { t, i18n } = useTranslation('pageNews')

  return (
    <div className='grid grid-cols-6 gap-4'>
      <H1 className={newsNew.image ? 'col-span-6' : 'col-span-4 col-start-2'}>
        {newsNew.title}
      </H1>
      {newsNew.image && (
        <ContentfulImage
          alt={newsNew.title}
          image={newsNew.image}
          width={309}
          quality={80}
          className='col-span-2'
        />
      )}
      <div className={newsNew.image ? 'col-span-4' : 'col-span-4 col-start-2'}>
        <p>
          {t('content.published', {
            date: new Date(newsNew.date).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          })}
        </p>
        <RichText content={newsNew.content} className='mt-2' assetWidth={634} />
      </div>
    </div>
  )
}

export default PageNews
