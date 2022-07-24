import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { Form } from '@remix-run/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactSelect from 'react-select'
import FormField from '~/components/formField'
import { H1 } from '~/components/globals'
import i18next from '~/i18next.server'
import { SEOKeywords, SEOTitle } from '~/utils/seo'

var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))
countries.registerLocale(require('i18n-iso-countries/langs/nl.json'))

export const loader: LoaderFunction = async props => {
  const t = await i18next.getFixedT(props.request, 'common')
  const meta = { title: t('pages.newsletter') }

  return { meta }
}

export const meta: MetaFunction = ({ data: { meta } }) => ({
  title: SEOTitle(meta.title),
  keywords: SEOKeywords(meta.title),
  description: meta.title
})
export let handle = {
  i18n: 'newsletter'
}

const PageNewsletter = () => {
  const { t, i18n } = useTranslation('newsletter')

  const [sendStatus, setSendStatus] = useState(false)

  const countriesOptions: string[] = []
  for (const country in countries.getNames(i18n.language)) {
    countriesOptions.push(country)
  }

  // const formSubmit = async (t, d) => {
  //   const data = {
  //     name: d.firstName + ' ' + d.lastName,
  //     email: d.email,
  //     type: '[Subscribe to newsletter]',
  //     subject: `from ${d.firstName} ${d.lastName}`,
  //     html: `<p>First name: ${d.firstName}</p>
  //     <p>Last name: ${d.lastName}</p>
  //     <p>Email: ${d.email}</p>
  //     <p>Country: ${d.country}</p>
  //     <p>GDPR: ${d.GDPR.toString()}</p>`
  //   }

  //   const response = await api('email', { token: t, ...data })
  //   if (response.success) {
  //     setSendStatus(true)
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  return (
    <>
      <H1>{t('heading')}</H1>
      <div>
        <div>
          <p>{t('description')}</p>
          <Form method='post'>
            <FormField label={t('first-name')}>
              <input name='firstName' type='text' required />
            </FormField>

            <FormField label={t('last-name')}>
              <input name='lastName' type='text' required />
            </FormField>

            <FormField label={t('email')}>
              <input name='email' type='email' required />
            </FormField>

            <FormField label={t('country')}>
              <ReactSelect name='country' options={countries} isSearchable />
            </FormField>

            <FormField label={t('GDPR')}>
              <input name='GDPR' type='checkbox' required />
            </FormField>

            {/* <Button
              variant='primary'
              type='submit'
              disabled={formState.isSubmitting || sendStatus}
            >
              {(formState.isSubmitting && (
                <>
                  <Spinner
                    as='span'
                    animation='border'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                  />
                  {` ${t('content.form.button.submitting')}`}
                </>
              )) ||
                (formState.submitCount !== 0 &&
                  (sendStatus
                    ? t('content.form.button.success')
                    : t('content.form.button.fail'))) ||
                t('content.form.button.default')}
            </Button> */}
          </Form>
        </div>
      </div>
    </>
  )
}

export default PageNewsletter
