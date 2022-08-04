import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure } from '@headlessui/react'
import { ActionArgs, json } from '@remix-run/cloudflare'
import { useFetcher, useLocation, useParams } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '~/components/button'
import FormField from '~/components/formField'
import { H4 } from '~/components/globals'
import classNames from '~/utils/classNames'
import { ObjectsObject_NameLocalized } from '~/utils/contentful'
import sendEmail from '~/utils/sendEmail'
import { SelectedVariation } from './object.$id'

export const loader = () => {
  throw json(null, { status: 404 })
}

export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData()
  const link = formData.get('link')
  const variant = formData.get('variant')
  const colour = formData.get('colour')
  const size = formData.get('size')
  const subject = formData.get('subject')
  const name = formData.get('name')
  const email = formData.get('email')
  const question = formData.get('question')
  const GDPR = formData.get('GDPR')
  const data = {
    name: `${name}`,
    email: `${email}`,
    type: '[Object inquiry]',
    subject: `${subject}`,
    html: `
      <p><a href="${link}" target="_blank">${link}</a></p>
      ${variant ? `<p>Variant: ${variant}</p>` : ''}
      ${colour ? `<p>Colour: ${colour}</p>` : ''}
      ${size ? `<p>Variant: ${size}</p>` : ''}
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>Question:\n${question?.toString().replace(/\r?\n/g, '<br />')}</p>
      <p>GDPR: ${GDPR?.toString()}</p>
    `
  }

  return await sendEmail({ context, data })
}

type Props = {
  object: Pick<ObjectsObject_NameLocalized, 'name'>
  selectedVariation: SelectedVariation | undefined
}

export const ObjectContact: React.FC<Props> = ({
  object,
  selectedVariation
}) => {
  const location = useLocation()
  const params = useParams()
  const { t } = useTranslation('object')
  const objectContact = useFetcher()

  useEffect(() => {
    if (objectContact.type === 'done' && objectContact.data === true) {
      setSent(true)
    }
  }, [objectContact])
  const [sent, setSent] = useState(false)

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={classNames(
              'peer',
              'flex w-full justify-between items-center',
              'px-4 py-2',
              'bg-stone-200',
              open ? 'rounded-tl rounded-tr' : 'rounded'
            )}
          >
            <span>{t('contact.button')}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              fixedWidth
              className={open ? 'rotate-180 transform' : ''}
            />
          </Disclosure.Button>
          <Disclosure.Panel
            children={
              <div
                className={classNames(
                  'px-4 py-2',
                  'border border-stone-200 rounded-bl rounded-br'
                )}
              >
                <objectContact.Form
                  method='post'
                  action={`/${params.locale}/object/contact`}
                >
                  <input
                    type='hidden'
                    name='link'
                    value={`https://www.terra-delft.nl${location.pathname}`}
                  />
                  <input
                    type='hidden'
                    name='sku'
                    value={selectedVariation?.sku}
                  />
                  <input
                    type='hidden'
                    name='variant'
                    value={selectedVariation?.variant}
                  />
                  <input
                    type='hidden'
                    name='colour'
                    value={selectedVariation?.colour}
                  />
                  <input
                    type='hidden'
                    name='size'
                    value={selectedVariation?.size}
                  />

                  <input
                    type='hidden'
                    name='subject'
                    value={t('contact.form.subject.value', {
                      name: object.name[params.locale!]
                    })}
                  />
                  <FormField
                    type='vertical'
                    label={t('contact.form.subject.label')}
                    children={
                      <input
                        readOnly
                        disabled
                        defaultValue={t('contact.form.subject.value', {
                          name: object.name[params.locale!]
                        })}
                        name='sub'
                        type='text'
                        required
                        className='p-2 border border-stone-200 rounded w-full'
                      />
                    }
                  />

                  <FormField
                    type='vertical'
                    label={t('contact.form.name.label')}
                    children={
                      <input
                        name='name'
                        type='text'
                        required
                        className='p-2 border border-stone-200 rounded w-full'
                      />
                    }
                  />

                  <FormField
                    type='vertical'
                    label={t('contact.form.email.label')}
                    children={
                      <input
                        name='email'
                        type='email'
                        required
                        className='p-2 border border-stone-200 rounded w-full'
                      />
                    }
                  />

                  <FormField
                    type='vertical'
                    label={t('contact.form.question.label')}
                    children={
                      <textarea
                        name='question'
                        rows={5}
                        required
                        className='p-2 border border-stone-200 rounded w-full'
                      />
                    }
                  />

                  <div className='flex flex-row items-center mb-4'>
                    <input name='GDPR' type='checkbox' required />
                    <span className='ml-2'>{t('contact.form.GDPR.label')}</span>
                  </div>

                  <Button
                    type='submit'
                    disabled={
                      objectContact.state === ('submitting' || 'loading') ||
                      sent
                    }
                  >
                    {objectContact.state === 'submitting'
                      ? t('contact.form.button.submitting')
                      : objectContact.state === 'loading'
                      ? t('contact.form.button.submitting')
                      : sent
                      ? t('contact.form.button.success')
                      : t('contact.form.button.default')}
                  </Button>
                </objectContact.Form>
              </div>
            }
          />
        </>
      )}
    </Disclosure>
  )
}
