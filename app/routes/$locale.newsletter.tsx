import { useTranslation } from 'react-i18next'
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  MetaFunction,
  useActionData,
  useLoaderData,
  useNavigation
} from 'react-router'
import Button from '~/components/button'
import FormField from '~/components/formField'
import { H1 } from '~/components/globals'
import i18next from '~/i18next.server'
import { invalidLocale } from '~/utils/invalidLocale'
import { linkHref } from '~/utils/linkHref'
import sendEmail from '~/utils/sendEmail'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

export const loader = async (args: LoaderFunctionArgs) => {
  invalidLocale(args.params.locale)

  const t = await i18next.getFixedT(args.request, 'common')
  const meta = { title: t('pages.newsletter') }

  let countries = require('i18n-iso-countries')
  switch (args.params.locale) {
    case 'en':
      countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
      break
    case 'nl':
      countries.registerLocale(require('i18n-iso-countries/langs/nl.json'))
      break
  }

  countries = countries.getNames(args.params.locale)
  const countriesOptions: string[] = []
  countriesOptions.push(countries.NL)
  countriesOptions.push(countries.BE)
  countriesOptions.push(countries.DE)
  for (const country in countries) {
    if (country in ['NL', 'BE', 'DE']) continue
    countriesOptions.push(countries[country])
  }

  return { meta, countriesOptions }
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
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

export const meta: MetaFunction<typeof loader> = ({ data, params }) =>
  data?.meta && [
    ...linkHref('newsletter', params.locale),
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

          <Button type='submit' disabled={navigation.state in ['submitting', 'loading'] || sent}>
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
