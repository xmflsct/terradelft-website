import {
  faGlobeEurope,
  faSearch,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import Navigation from './navigation'
import { useTranslation } from 'react-i18next'
import { Link as RemixLink, useMatches, useParams } from '@remix-run/react'
import { Link } from '~/components/link'
import logoEnLarge from '~/images/logo/en/large.png'
import logoEnSmall from '~/images/logo/en/small.png'
import logoNlLarge from '~/images/logo/nl/large.png'
import logoNlSmall from '~/images/logo/nl/small.png'
import i18n from '~/i18n'
import { BagContext } from '~/states/bag'

const Header = () => {
  const matches = useMatches()
  const {
    i18n: { language },
    t
  } = useTranslation()
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
    <header className='mb-8'>
      <div className='block lg:hidden'>
        <button
        // className={`hamburger hamburger--collapse ${
        //   stateMobileMenu ? 'is-active' : ''
        // }`}
        // aria-label='Menu'
        // onClick={() => dispatch()}
        >
          <span className='hamburger-box'>
            <span className='hamburger-inner' />
          </span>
        </button>
      </div>
      <div className='flex flex-row mb-2'>
        <div className='flex-2'>
          <Link to='/'>
            {language === 'nl' && (
              <>
                <img src={logoNlLarge} className='hidden lg:block' />
                <img src={logoNlSmall} className='block lg:hidden' />
              </>
            )}
            {language === 'en' && (
              <>
                <img src={logoEnLarge} className='hidden lg:block' />
                <img src={logoEnSmall} className='block lg:hidden' />
              </>
            )}
          </Link>
        </div>
        <div className='flex-1'>
          <div className='justify-content-end h-100'>
            <div className='language-switcher'>
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
            <div className='bag-link'>
              <Link to='/bag'>
                <FontAwesomeIcon icon={faShoppingBag} size='sm' fixedWidth />
                <span className='small-block'>{` (${objects.reduce(
                  (total, obj) => obj.amount + total,
                  0
                )})`}</span>
              </Link>
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
      <Navigation />
    </header>
  )
}

export default Header
