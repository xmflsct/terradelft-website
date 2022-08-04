import { faGlobeEurope, faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useState } from 'react'
import Navigation from './navigation'
import { useTranslation } from 'react-i18next'
import { Link as RemixLink, useMatches } from '@remix-run/react'
import { Link } from '~/components/link'
import logoEnLarge from '~/images/logo/en/large.png'
import logoEnSmall from '~/images/logo/en/small.png'
import logoNlLarge from '~/images/logo/nl/large.png'
import logoNlSmall from '~/images/logo/nl/small.png'
import i18n from '~/i18n'
import { BagContext } from '~/states/bag'
import classNames from '~/utils/classNames'

const Header: React.FC = () => {
  const matches = useMatches()
  const {
    i18n: { language },
    t
  } = useTranslation()
  const [toggleNav, setToggleNav] = useState(false)
  // const { stateMobileMenu, dispatch } = useContext(ContextMobileMenu)
  // const [miniBag, setMiniBag] = useState(false)
  // const [locationOrigin, setLocationOrigin] = useState()

  const { objects } = useContext(BagContext)

  // const prevBagLength = useRef(objects.length)
  // useEffect(() => {
  //   if (objects.length > prevBagLength.current) {
  //     // setMiniBag(true)
  //     prevBagLength.current = objects.length
  //   }
  // }, [objects.length, prevBagLength])

  // useEffect(() => {
  //   setLocationOrigin(window.location.origin)
  // }, [])

  return (
    <header
      className={classNames(
        'z-50 sticky top-0 lg:relative lg:top-auto bg-background',
        'border-b-2 border-secondary lg:border-none',
        'mb-4 lg:mb-8',
        'pt-4 pb-2 lg:p-0'
      )}
    >
      <div className='flex flex-row mb-0 lg:mb-4'>
        <div className='flex-1 block lg:hidden'>
          <button
            aria-label='Mobile hamburger menu'
            className='p-2'
            onClick={() => {
              toggleNav === false &&
                typeof window !== undefined &&
                window.scrollTo(0, 0)
              setToggleNav(!toggleNav)
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-6 h-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>
        <div className='flex-2'>
          <Link to='/' className='flex flex-col items-center'>
            {language === 'nl' && (
              <>
                <img src={logoNlLarge} className='hidden lg:block' />
                <img src={logoNlSmall} className='block lg:hidden w-9/12' />
              </>
            )}
            {language === 'en' && (
              <>
                <img src={logoEnLarge} className='hidden lg:block' />
                <img src={logoEnSmall} className='block lg:hidden w-9/12' />
              </>
            )}
          </Link>
        </div>
        <div className='flex-1'>
          <div className='flex flex-row gap-2 lg:gap-4 justify-end'>
            <div className='text-center text-primary hover:text-secondary'>
              {i18n.supportedLngs
                .filter(locale => locale !== language)
                .map(locale => (
                  <RemixLink
                    key={locale}
                    to={`/${locale}${matches[
                      matches.length - 1
                    ].pathname.replace(new RegExp(/^\/[a-z][a-z]/), '')}`}
                  >
                    <FontAwesomeIcon
                      icon={faGlobeEurope}
                      size='sm'
                      fixedWidth
                    />
                    <span className='hidden lg:contents'>
                      {' ' +
                        t(`common:header.language-switcher.long.${locale}`)}
                    </span>
                    <span className='contents lg:hidden'>
                      {' ' +
                        t(`common:header.language-switcher.short.${locale}`)}
                    </span>
                  </RemixLink>
                ))}
            </div>
            <div className='text-center'>
              <Link
                to='/bag'
                className='!text-primary hover:!text-secondary hover:no-underline'
              >
                <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
                <span className='small-block'>{` (${objects.reduce(
                  (total, obj) => obj.amount + total,
                  0
                )})`}</span>
              </Link>
            </div>
          </div>
          <div className='search-box align-self-end'>
            {/* <Form
                action={`${locationOrigin}${t(
                  'common:slug.static.search.slug',
                  {
                    locale: i18n.language
                  }
                )}`}
              >
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      background: 'none',
                      border: 'none',
                      borderRadius: 0,
                      borderBottom: '#394c50 1px solid'
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} size='sm' fixedWidth />
                  </InputGroup.Text>
                  <Form.Control name='query' placeholder='Search' />
                </InputGroup>
              </Form> */}
          </div>
        </div>
      </div>
      {/* <CSSTransition
        in={miniBag}
        onEnter={() => {
          setTimeout(() => {
            setMiniBag(false)
          }, 3000)
        }}
        timeout={350}
        className='mini-bag'
        classNames='mini-bag'
      >
        <div>{t('common:header.mini-bag')}</div>
      </CSSTransition> */}
      <Navigation toggleNav={toggleNav} />
    </header>
  )
}

export default Header
