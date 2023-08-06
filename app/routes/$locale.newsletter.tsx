import { ActionArgs, json, LoaderArgs, V2_MetaFunction } from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import Button from '~/components/button'
import FormField from '~/components/formField'
import { H1 } from '~/components/globals'
import i18next from '~/i18next.server'
import sendEmail from '~/utils/sendEmail'
import { SEOKeywords, SEOTitle } from '~/utils/seo'
import { LoaderData } from '~/utils/unwrapLoaderData'

export const loader = async (props: LoaderArgs) => {
  const t = await i18next.getFixedT(props.request, 'common')
  const meta = { title: t('pages.newsletter') }

  let countries = require('i18n-iso-countries')
  switch (props.params.locale) {
    case 'en':
      countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
      break
    case 'nl':
      countries.registerLocale(require('i18n-iso-countries/langs/nl.json'))
      break
  }

  countries = countries.getNames(props.params.locale)
  const countriesOptions: string[] = []
  countriesOptions.push(countries.NL)
  countriesOptions.push(countries.BE)
  countriesOptions.push(countries.DE)
  for (const country in countries) {
    if (country === ('NL' || 'BE' || 'DE')) continue
    countriesOptions.push(countries[country])
  }

  return json({ meta, countriesOptions })
}

export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData()
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const email = formData.get('email')
  const country = formData.get('country')
  const GDPR = formData.get('GDPR')
  const data = {
    name: firstName + ' ' + lastName,
    email: `${email}`,
    type: '[Subscribe to newsletter]',
    subject: `from ${firstName} ${lastName}`,
    html: `<p>First name: ${firstName}</p>
    <p>Last name: ${lastName}</p>
    <p>Email: ${email}</p>
    <p>Country: ${country}</p>
    <p>GDPR: ${GDPR?.toString()}</p>`
  }

  return await sendEmail({ context, data })
}

export const meta: V2_MetaFunction = ({ data }: { data: LoaderData<typeof loader> }) =>
  data?.meta && [
    { title: SEOTitle(data.meta.title) },
    { name: 'keywords', content: SEOKeywords([data.meta.title]) }
  ]
export let handle = {
  i18n: 'newsletter'
}

const PageNewsletter = () => {
  const { countriesOptions } = useLoaderData<typeof loader>()
  const { t } = useTranslation('newsletter')

  const sent = useActionData<typeof action>()
  const navigation = useNavigation()

  return (
    <div className='grid grid-cols-6 gap-4'>
      <H1 className='col-span-6 lg:col-span-4 lg:col-start-2'>{t('heading')}</H1>
      <div className='col-span-6 lg:col-span-4 lg:col-start-2'>
        <p>{t('description')}</p>
        <Form method='post'>
          <FormField type='vertical' label={t('first-name')}>
            <input
              name='firstName'
              type='text'
              required
              className='p-2 border border-stone-200 rounded w-full lg:w-96'
            />
          </FormField>

          <FormField type='vertical' label={t('last-name')}>
            <input
              name='lastName'
              type='text'
              required
              className='p-2 border border-stone-200 rounded w-full lg:w-96'
            />
          </FormField>

          <FormField type='vertical' label={t('email')}>
            <input
              name='email'
              type='email'
              required
              className='p-2 border border-stone-200 rounded w-full lg:w-96'
            />
          </FormField>

          <FormField type='vertical' label={t('country')}>
            <select
              name='country'
              required
              className='p-2 border border-stone-200 founded w-full lg:w-96'
            >
              {countriesOptions.map((country, index) => (
                <option key={index} value={country} children={country} />
              ))}
            </select>
          </FormField>

          <div className='flex flex-row items-center mb-4'>
            <input name='GDPR' type='checkbox' required />
            <span className='ml-2'>{t('GDPR')}</span>
          </div>

          <Button type='submit' disabled={navigation.state === ('submitting' || 'loading') || sent}>
            {navigation.state === 'submitting'
              ? t('button.submitting')
              : navigation.state === 'loading'
              ? t('button.submitting')
              : sent
              ? t('button.success')
              : t('button.default')}
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default PageNewsletter
