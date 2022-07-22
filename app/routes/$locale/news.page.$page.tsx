import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData, useParams } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import ContentfulImage from '~/components/image'
import { Link } from '~/components/link'
import Pagination from '~/components/pagination'
import i18next from '~/i18next.server'
import { cacheQuery, getNewsNews, NewsNews } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'pageNews')
    const meta = { title: t('name') }

    const data = await getNewsNews(props)
    return { meta, data }
  })

export const meta: MetaFunction = ({ data: { meta } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: 'News'
})
export let handle = {
  i18n: 'pageNews'
}

const PageNews = () => {
  const {
    data: { total, items }
  } = useLoaderData<{
    data: { total: number; items: NewsNews[] }
  }>()
  const { page } = useParams()
  const { t, i18n } = useTranslation('pageNews')

  return (
    <>
      <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
        {items?.map(news => {
          return (
            <div key={news.sys.id}>
              <Link to={`/news/${news.sys.id}`}>
                <ContentfulImage
                  alt={news.title}
                  image={news.image}
                  width={309}
                  height={309}
                  quality={80}
                  behaviour='fill'
                  focusArea='faces'
                  className='mb-2'
                />
                <p className='text-lg truncate'>{news.title}</p>
              </Link>
              <p>
                {t('content.published', {
                  date: new Date(news.date).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                })}
              </p>
            </div>
          )
        })}
      </div>
      <Pagination basePath='/news/page' page={page!} total={total} />
    </>
  )
}

export default PageNews
