// import { faSearch } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from '../link'

// const activeChildren = (location, children) => {
//   if (location.pathname.includes(children)) {
//     return { className: 'active-children' }
//   }
// }

const styleNavItem = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'flex-1 text-center p-2 bg-secondary text-background border border-secondary'
    : 'flex-1 text-center p-2 bg-background text-secondary border border-secondary'

const Navigation = () => {
  const { t, i18n } = useTranslation()
  const [locationOrigin, setLocationOrigin] = useState<string>()

  useEffect(() => {
    setLocationOrigin(window.location.origin)
  }, [])

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
        className={styleNavItem}
        // getProps={({ location }) => {
        //   activeChildren(
        //     location,
        //     t('common:navigation.1.children', { locale: i18n.language })
        //   )
        // }}
      >
        {t('common:navigation.1.name')}
      </NavLink>
      <NavLink to='/shop' className={styleNavItem}>
        {props => {
          console.log(props)
          return t('common:navigation.2.name')
        }}
      </NavLink>
      <NavLink
        to='/exhibitions'
        className={styleNavItem}
        // getProps={({ location }) => {
        //   activeChildren(
        //     location,
        //     t('common:navigation.3.children', { locale: i18n.language })
        //   )
        // }}
      >
        {t('common:navigation.3.name')}
      </NavLink>
      <NavLink
        to='/news/page/1'
        className={styleNavItem}
        // getProps={({ location }) => {
        //   activeChildren(
        //     location,
        //     t('common:navigation.4.children', { locale: i18n.language })
        //   )
        // }}
      >
        {t('common:navigation.4.name')}
      </NavLink>
      <NavLink
        to='/terra-in-china'
        className={styleNavItem}
        // getProps={({ location }) => {
        //   activeChildren(
        //     location,
        //     t('common:navigation.5.children', { locale: i18n.language })
        //   )
        // }}
      >
        {t('common:navigation.5.name')}
      </NavLink>
      <NavLink
        to='/terra-in-china'
        className={styleNavItem}
        // getProps={({ location }) => {
        //   activeChildren(
        //     location,
        //     t('common:navigation.5.children', { locale: i18n.language })
        //   )
        // }}
      >
        {t('common:navigation.5.name')}
      </NavLink>
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
