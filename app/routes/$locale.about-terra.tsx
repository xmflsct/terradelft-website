import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { gql } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router'
import { H1, H2, H4 } from '~/components/globals'
import ContentfulImage from '~/components/image'
import RichText from '~/components/richText'
import cache from '~/utils/cache'
import { AboutTerra, graphqlRequest, RICH_TEXT_LINKS } from '~/utils/contentful'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import loadMeta from '~/utils/loadMeta'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const data = await cache<{ page: AboutTerra }>({
    ...args,
    req: graphqlRequest({
      ...args,
      query: gql`
        query PageAboutTerra($preview: Boolean, $locale: String) {
          page: informationAboutTerra(
            preview: $preview
            locale: $locale
            id: "7eZ2uEBMVW8HDUMlBXLxgx"
          ) {
            columnLeft {
              json
              ${RICH_TEXT_LINKS}
            }
            columnRight {
              json
              ${RICH_TEXT_LINKS}
            }
            staffCollection {
              items {
                name
                avatar {
                  url
                  width
                  height
                }
                biography {
                  json
                  ${RICH_TEXT_LINKS}
                }
              }
            }
          }
        }
      `
    })
  })
  const meta = await loadMeta(args, { titleKey: 'pages.about-terra' })

  return { meta, data }
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta
    ? [
        ...linkHref('about-terra', params.locale),
        { title: SEOTitle(data.meta.title) },
        { name: 'keywords', content: SEOKeywords([data.meta.title]) },
        data.data?.page?.columnLeft?.json && {
          name: 'description',
          content: documentToPlainTextString(data.data.page.columnLeft.json).substring(0, 199)
        }
      ]
    : []
export let handle = { i18n: 'aboutTerra' }

const PageAboutTerra = () => {
  const {
    data: { page }
  } = useLoaderData<typeof loader>()
  const { t } = useTranslation('aboutTerra')

  return (
    <>
      <H1>{t('common:pages.about-terra')}</H1>
      <div className='lg:grid lg:grid-cols-2 gap-4'>
        <RichText content={page.columnLeft} assetWidth={471} />
        <RichText content={page.columnRight} assetWidth={471} />
      </div>
      <div className='terra-staff'>
        <H2>{t('staff')}</H2>
        {page.staffCollection?.items.map(staff => (
          <div key={staff.name} className='grid grid-cols-6 gap-4 mb-8'>
            <div className='col-span-2 lg:col-span-1'>
              <ContentfulImage alt={staff.name} image={staff.avatar} width={309} quality={80} />
              <H4 className='mt-1 text-center'>{staff.name}</H4>
            </div>
            <RichText content={staff.biography} className='col-span-6 lg:col-span-5' />
          </div>
        ))}
      </div>
    </>
  )
}

export default PageAboutTerra
