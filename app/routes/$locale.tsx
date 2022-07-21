import { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet, useLoaderData } from '@remix-run/react'
import { useChangeLanguage } from 'remix-i18next'
import Layout from '~/components/layout'
import i18n from '~/i18n'

export const loader: LoaderFunction = async ({ params }) => {
  return params.locale
}

const Page$Lng: React.FC = () => {
  const locale = useLoaderData<string>()
  if (i18n.supportedLngs.includes(locale)) {
    useChangeLanguage(locale)
  } else {
    useChangeLanguage('en')
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default Page$Lng
