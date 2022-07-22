// import { faSearch } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
      <NavLink
        to='/about-terra'
        className={styleNavItem([
          '/about-terra',
          '/reach-terra',
          '/newsletter'
        ])}
        children={t('common:navigation.6.name')}
      />
      {/* <Dropdown as={Col} xs={12} sm={4} md={2} role='menu' className='nav-item'>
        <Dropdown.Toggle as={Col}>
          {t('common:navigation.6.name')}
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Link to='/about-terra'>{t('common:navigation.6.1.name')}</Link>
          <Link to='/reach-terra'>{t('common:navigation.6.2.name')}</Link>
          <Link to='/newsletter'>{t('common:navigation.6.3.name')}</Link>
        </Dropdown.Menu>
      </Dropdown> */}
    </nav>
  )
}

export default Navigation
