import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1, H2, H4 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import i18next from '~/i18next.server'
import { AboutTerra, cacheQuery, getAboutTerra } from '~/utils/contentful'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader: LoaderFunction = async props =>
  await cacheQuery(30, props, async () => {
    const t = await i18next.getFixedT(props.request, 'pageAboutTerra')
    const meta = { title: t('name') }

    return { meta, data: await getAboutTerra(props) }
  })

export const meta: MetaFunction = ({ data: { meta, data } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: documentToPlainTextString(data.columnLeft.json).substring(0, 199)
})
export let handle = {
  i18n: 'pageAboutTerra'
}

const PageAboutTerra = () => {
  const { data } = useLoaderData<{ data: AboutTerra }>()
  const { t } = useTranslation('pageAboutTerra')

  return (
    <>
      <H1>{t('name')}</H1>
      <div className='grid grid-cols-2 gap-4'>
        <RichText content={data.columnLeft} assetWidth={471} />
        <RichText content={data.columnRight} assetWidth={471} />
      </div>
      <div className='terra-staff'>
        <H2>{t('content.staff')}</H2>
        {data.staffCollection?.items.map(staff => (
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
