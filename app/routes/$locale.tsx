import { json, LoaderArgs } from '@remix-run/cloudflare'
import { Outlet, useLoaderData } from '@remix-run/react'
import { useChangeLanguage } from 'remix-i18next'
import Layout from '~/components/layout'
import i18n from '~/i18n'

export const loader = ({ params }: LoaderArgs) => {
  return json(params.locale)
}

const Page$Locale: React.FC = () => {
  const locale = useLoaderData<typeof loader>()
  if (i18n.supportedLngs.includes(locale)) {
    useChangeLanguage(locale)
  } else {
    useChangeLanguage('en')
  }

  return <Layout children={<Outlet />} />
}

export default Page$Locale
