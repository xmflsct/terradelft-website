import { gql, QueryOptions } from '@apollo/client'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { json, LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1, H2, H4 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import { AboutTerra, cacheQuery, richTextLinks } from '~/utils/contentful'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

type Data = {
  meta: { title: string }
  data: { page: AboutTerra }
}
export const loader: LoaderFunction = async props => {
  const query: QueryOptions<{ locale: string }> = {
    variables: { locale: props.params.locale! },
    query: gql`
      query Index($locale: String) {
        page: informationAboutTerra ( locale: $locale, id: "7eZ2uEBMVW8HDUMlBXLxgx" ) {
          columnLeft {
            json
            ${richTextLinks}
          }
          columnRight {
            json
            ${richTextLinks}
          }
          staffCollection {
            items {
              name
              avatar {
                url
              }
              biography {
                json
                ${richTextLinks}
              }
            }
          }
        }
      }
    `
  }
  const data = await cacheQuery<Data['data']>(query, 30, props)
  const meta = await loadMeta(props, { titleKey: 'pages.about-terra' })

  return json({ meta, data })
}

export const meta: MetaFunction = ({ data }: { data: Data }) =>
  data?.meta && {
    title: SEOTitle(data.meta.title),
    keywords: SEOKeywords([data.meta.title]),
    ...(data.data?.page?.columnLeft?.json && {
      description: documentToPlainTextString(
        data.data.page.columnLeft.json
      ).substring(0, 199)
    })
  }
export let handle = {
  i18n: 'aboutTerra'
}

const PageAboutTerra = () => {
  const {
    data: { page }
  } = useLoaderData<Data>()
  const { t } = useTranslation('aboutTerra')

  return (
    <>
      <H1>{t('common:pages.about-terra')}</H1>
      <div className='grid grid-cols-2 gap-4'>
        <RichText content={page.columnLeft} assetWidth={471} />
        <RichText content={page.columnRight} assetWidth={471} />
      </div>
      <div className='terra-staff'>
        <H2>{t('staff')}</H2>
        {page.staffCollection?.items.map(staff => (
          <div key={staff.name} className='grid grid-cols-6 gap-4 mb-8'>
            <div className='col-span-1'>
              <ContentfulImage
                alt={staff.name}
                image={staff.avatar}
                width={309}
                quality={80}
              />
              <H4 className='mt-1 text-center'>{staff.name}</H4>
            </div>
            <RichText content={staff.biography} className='col-span-5' />
          </div>
        ))}
      </div>
    </>
  )
}

export default PageAboutTerra
