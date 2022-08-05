import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import classNames from '~/utils/classNames'

type Props = {
  type: 'header' | 'navigation'
}

const Search: React.FC<Props> = ({ type }) => {
  const { i18n } = useTranslation()

  return (
    <Form
      method='get'
      action={`/${i18n.language}/search`}
      className={classNames(
        type === 'header' ? 'hidden lg:flex' : 'flex lg:hidden',
        'flex-row justify-end content-end'
      )}
    >
      <input
        type='text'
        name='query'
        className='justify-self-end px-4 py-2 bg-background border-b border-b-stone-500'
      />
      <button
        children={<FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />}
        className='px-2 border-b border-b-stone-500'
      />
    </Form>
  )
}

export default Search
