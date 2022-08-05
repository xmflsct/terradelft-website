import { json, LoaderArgs } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import Layout from '~/components/layout'
import i18n from '~/i18n'

export const loader = ({ params }: LoaderArgs) => {
  const locale = params.locale
  if (!locale) throw json(null, { status: 404 })

  if (!i18n.supportedLngs.includes(locale)) {
    throw json(null, { status: 404 })
  }

  return null
}

const Page$Locale: React.FC = () => {
  return <Layout children={<Outlet />} />
}

export default Page$Locale
