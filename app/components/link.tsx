import { Dispatch, PropsWithChildren, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { LinkProps, NavLinkProps, Link as RemixLink, NavLink as RemixNavLink } from 'react-router'
import classNames from '~/utils/classNames'

const Link: React.FC<PropsWithChildren & LinkProps> = props => {
  if (!props.to) {
    return <>{props.children}</>
  }

  const {
    i18n: { language }
  } = useTranslation()

  const to = props.to.toString().startsWith('/') ? props.to : `/${props.to}`

  return (
    <RemixLink
      {...props}
      className={classNames(
        'text-secondary underline-offset-4 no-underline hover:underline',
        props.className
      )}
      to={`/${language}${to === '/' ? '' : to}`}
    />
  )
}

const NavLink: React.FC<NavLinkProps & { setToggleNav: Dispatch<SetStateAction<boolean>> }> = ({
  setToggleNav,
  ...props
}) => {
  const {
    i18n: { language }
  } = useTranslation()

  return (
    <RemixNavLink
      {...props}
      to={`/${language}${props.to === '/' ? '' : props.to}`}
      onClick={() => setToggleNav(false)}
    />
  )
}

export { Link, NavLink }
