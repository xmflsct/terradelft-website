// import { config } from '@fortawesome/fontawesome-svg-core'
import React from 'react'
import BagProvider from '~/states/bag'
import Footer from './footer'
import Header from './header'

const Layout: React.FC<React.PropsWithChildren> = props => {
  // if (typeof window !== 'undefined') {
  //   document.body.style.overflow = stateMobileMenu ? 'hidden' : 'scroll'
  // }
  // config.autoAddCss = false

  return (
    <BagProvider>
      <div className='max-w-5xl m-0 lg:mx-auto lg:my-8 p-4 lg:p-8 lg:border lg:border-secondary'>
        <Header />
        <main className='my-4' {...props} />
        <Footer />
      </div>
    </BagProvider>
  )
}

export default Layout
