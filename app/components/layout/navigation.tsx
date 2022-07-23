import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Transition } from '@headlessui/react'
import { useLocation } from '@remix-run/react'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from '~/utils/classNames'
import { NavLink } from '../link'

// const activeChildren = (location, children) => {
//   if (location.pathname.includes(children)) {
//     return { className: 'active-children' }
//   }
// }

const Navigation = () => {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  const [locationOrigin, setLocationOrigin] = useState<string>()

  useEffect(() => {
    setLocationOrigin(window.location.origin)
  }, [])

  const styleNavItem =
    (paths: string[]) =>
    ({ isActive }: { isActive: boolean }) =>
      isActive ||
      paths.map(path => pathname.includes(path)).filter(path => path).length > 0
        ? 'flex-1 text-center p-2 bg-secondary text-background border border-secondary'
        : 'flex-1 text-center p-2 bg-background text-secondary border border-secondary'

  return (
    <nav className='flex flex-row gap-4'>
      <div className='hidden'>
        <form action={`${locationOrigin}/search`}>
          {/* <InputGroup>
            <InputGroup.Text>
              <Button variant='link' type='submit'>
                <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
              </Button>
            </InputGroup.Text>
            <Form.Control name='query' placeholder='Search' />
          </InputGroup> */}
        </form>
      </div>
      <NavLink
        to='/'
        end
        className={styleNavItem(['/artist/'])}
        children={t('common:navigation.1.name')}
      />
      <NavLink
        to='/shop'
        className={styleNavItem(['/object/'])}
        children={t('common:navigation.2.name')}
      />
      <NavLink
        to='/exhibitions'
        className={styleNavItem(['/exhibition/'])}
        children={t('common:navigation.3.name')}
      />
      <NavLink
        to='/news/page/1'
        className={styleNavItem(['/news/'])}
        children={t('common:navigation.4.name')}
      />
      <NavLink
        to='/terra-in-china'
        className={styleNavItem([])}
        children={t('common:navigation.5.name')}
      />
      <Menu
        as='div'
        className={classNames(
          'relative inline-block text-left',
          styleNavItem(['/about-terra', '/reach-terra'])({ isActive: false })
        )}
      >
        {({ open }) => (
          <>
            <Menu.Button>
              <span>
                {t('common:navigation.6.name')}
                <FontAwesomeIcon
                  icon={open ? faChevronUp : faChevronDown}
                  className='ml-2'
                />
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter='transition ease-out duration-100'
              enterFrom='transform opacity-0 scale-95'
              enterTo='transform opacity-100 scale-100'
              leave='transition ease-in duration-75'
              leaveFrom='transform opacity-100 scale-100'
              leaveTo='transform opacity-0 scale-95'
            >
              <Menu.Items className='z-50 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col p-2'>
                <Menu.Item
                  children={
                    <NavLink
                      to='/about-terra'
                      className={styleNavItem([])}
                      children={t('common:navigation.6.1.name')}
                    />
                  }
                />
                <Menu.Item
                  children={
                    <NavLink
                      to='/reach-terra'
                      className={styleNavItem([])}
                      children={t('common:navigation.6.2.name')}
                    />
                  }
                />
                <Menu.Item
                  children={
                    <NavLink
                      to='/newsletter'
                      className={styleNavItem([])}
                      children={t('common:navigation.6.3.name')}
                    />
                  }
                />
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </nav>
  )
}

export default Navigation
