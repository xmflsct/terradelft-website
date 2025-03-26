import { data as loaderData, LoaderFunctionArgs, Outlet } from 'react-router'
import Layout from '~/components/layout'
import { invalidLocale } from '~/utils/invalidLocale'

export const loader = ({ params }: LoaderFunctionArgs) => {
  const locale = params.locale
  if (!locale) throw loaderData(null, { status: 404 })

  invalidLocale(locale)

  return null
}

const Page$Locale: React.FC = () => {
  return <Layout children={<Outlet />} />
}

export default Page$Locale
