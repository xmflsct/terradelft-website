import * as Sentry from '@sentry/react'
import { useTranslation } from 'react-i18next'
import {
  isRouteErrorResponse,
  Links,
  LinksFunction,
  LoaderFunctionArgs,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useRouteError
} from 'react-router'
import { H1 } from '~/components/globals'
import Layout from '~/components/layout'
import StructuredData from '~/components/StructuredData'
import i18n from '~/i18n'
import i18next from '~/i18next.server'
import notFound from '~/images/404.jpg'
import stylesheet from '~/tailwind.css?url'
import { SEOTitle } from '~/utils/seo'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesheet }]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await i18next.getLocale(request)

  const { pathname, search } = new URL(request.url)

  if (pathname === '/') {
    return redirect(`/${i18n.supportedLngs.includes(locale) ? locale : 'nl'}`, {
      status: 302,
      headers: { 'Cache-Control': 'no-cache' }
    })
  }

  if (pathname.endsWith('/')) {
    return redirect(`${pathname.slice(0, -1)}${search}`, 301)
  }

  return null
}

export const handle = {
  i18n: 'common'
}

export default function Root() {
  const {
    i18n: { dir, language }
  } = useTranslation()

  return (
    <html lang={language} dir={dir()}>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
        <StructuredData />
      </head>
      <body className='scroll-smooth bg-background text-primary'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const { t } = useTranslation('common')

  const error = useRouteError()
  if (!isRouteErrorResponse(error) && error && error instanceof Error) {
    Sentry.captureException(error)
  }

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <html>
        <head>
          <title>{SEOTitle(t('pages.404'))}</title>
          <Meta />
          <Links />
        </head>
        <body className='scroll-smooth bg-background text-primary'>
          <Layout>
            <H1>
              {t('pages.404')} {error.status}
            </H1>
            <img src={notFound} />
          </Layout>
          <Scripts />
        </body>
      </html>
    )
  }
}
