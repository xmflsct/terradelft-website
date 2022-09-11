import { LinksFunction, LoaderArgs, MetaFunction, redirect } from '@remix-run/cloudflare'
import { Links, LiveReload, Meta, Scripts, ScrollRestoration, Outlet } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { H1 } from '~/components/globals'
import Layout from '~/components/layout'
import StructuredData from '~/components/StructuredData'
import i18n from '~/i18n'
import i18next from '~/i18next.server'
import notFound from '~/images/404.jpg'
import styles from '~/styles/app.css'
import { SEOTitle } from '~/utils/seo'

export const loader = async ({ request }: LoaderArgs) => {
  const locale = await i18next.getLocale(request)

  if (new URL(request.url).pathname === '/') {
    return redirect(`/${i18n.supportedLngs.includes(locale) ? locale : 'nl'}`, {
      status: 302,
      headers: { 'Cache-Control': 'no-cache' }
    })
  }

  return null
}

export const handle = {
  i18n: 'common'
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1'
})

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function Root() {
  const {
    i18n: { dir, language }
  } = useTranslation()

  return (
    <html lang={language} dir={dir()}>
      <head>
        <Meta />
        <Links />
        <StructuredData />
      </head>
      <body className='scroll-smooth bg-background text-primary'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const { t } = useTranslation('common')

  return (
    <html>
      <head>
        <title>{SEOTitle(t('pages.404'))}</title>
        <Meta />
        <Links />
      </head>
      <body className='scroll-smooth bg-background text-primary'>
        <Layout>
          <H1>{t('pages.404')}</H1>
          <img src={notFound} />
        </Layout>
        <Scripts />
      </body>
    </html>
  )
}
