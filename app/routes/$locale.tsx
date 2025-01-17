import { data as loaderData, LoaderFunctionArgs, Outlet } from 'react-router';
import Layout from '~/components/layout';
import i18n from '~/i18n';

export const loader = ({ params }: LoaderFunctionArgs) => {
  const locale = params.locale
  if (!locale) throw loaderData(null, { status: 404 })

  if (!i18n.supportedLngs.includes(locale)) {
    throw loaderData(null, { status: 404 })
  }

  return null
}

const Page$Locale: React.FC = () => {
  return <Layout children={<Outlet />} />
}

export default Page$Locale
