import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Transition } from '@headlessui/react'
import { useLocation } from '@remix-run/react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from '~/utils/classNames'
import { NavLink } from '../link'

type Props = {
  toggleNav: boolean
}

const Navigation: React.FC<Props> = ({ toggleNav }) => {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()

  const styleNavItem =
    (paths: string[]) =>
    ({ isActive }: { isActive: boolean }) =>
      isActive ||
      paths.map(path => pathname.slice(3).startsWith(path)).filter(path => path)
        .length > 0
        ? 'flex-1 text-center p-2 bg-secondary text-background border border-secondary'
        : 'flex-1 text-center p-2 bg-background text-secondary border border-secondary'

  return (
    <nav
      className={classNames(
        'py-4 lg:p-0',
        `${toggleNav ? 'flex' : 'hidden'} lg:flex`,
        'flex-col lg:flex-row gap-4'
      )}
    >
      {/* <div className='hidden'>
        <form action={`${locationOrigin}/search`}>
          <InputGroup>
            <InputGroup.Text>
              <Button variant='link' type='submit'>
                <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
              </Button>
            </InputGroup.Text>
            <Form.Control name='query' placeholder='Search' />
          </InputGroup>
        </form>
      </div> */}
      <NavLink
        to='/'
        end
        className={styleNavItem(['/artist/'])}
        children={t('pages.index')}
      />
      <NavLink
        to='/shop/page/1'
        className={styleNavItem(['/object/'])}
        children={t('pages.shop')}
      />
      <NavLink
        to='/exhibitions'
        className={styleNavItem(['/exhibition/'])}
        children={t('pages.exhibitions')}
      />
      <NavLink
        to='/news/page/1'
        className={styleNavItem(['/news/'])}
        children={t('pages.news')}
      />
      <NavLink
        to='/terra-in-china'
        className={styleNavItem([])}
        children={t('pages.terra-in-china')}
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
                {t('pages.about-us')}
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
              <Menu.Items className='z-50 origin-top-right absolute right-0 mt-2 w-full lg:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col gap-4 p-4'>
                <Menu.Item
                  children={
                    <NavLink
                      to='/about-terra'
                      className={styleNavItem([])}
                      children={t('pages.about-terra')}
                    />
                  }
                />
                <Menu.Item
                  children={
                    <NavLink
                      to='/reach-terra'
                      className={styleNavItem([])}
                      children={t('pages.reach-terra')}
                    />
                  }
                />
                <Menu.Item
                  children={
                    <NavLink
                      to='/newsletter'
                      className={styleNavItem([])}
                      children={t('pages.newsletter')}
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
