import { useTranslation } from 'react-i18next'
import { NewsNews } from '~/utils/contentful'
import ContentfulImage from '../image'
import { Link } from '../link'

type Props = {
  news: Pick<NewsNews, 'sys' | 'title' | 'image' | 'date'>[]
}

const ListNews: React.FC<Props> = ({ news }) => {
  const { t, i18n } = useTranslation('news')

  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8'>
      {news?.map(news => {
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
              <p className='text-lg truncate mt-1'>{news.title}</p>
            </Link>
            <p>
              {t('published', {
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
  )
}

export default ListNews
