// import { config } from '@fortawesome/fontawesome-svg-core'
import React, { useReducer } from 'react'
import BagProvider from '~/states/bag'
import Announcement from './announcement'
import Footer from './footer'
import Header from './header'

const Layout: React.FC<React.PropsWithChildren> = props => {
  // if (typeof window !== 'undefined') {
  //   document.body.style.overflow = stateMobileMenu ? 'hidden' : 'scroll'
  // }
  // config.autoAddCss = false

  return (
    <BagProvider>
      <div className='max-w-5xl mx-auto border border-secondary p-8 my-8'>
        <Header />
        {/* <Announcement /> */}
        <main className='my-4' {...props} />
        <Footer />
      </div>
    </BagProvider>
  )
}

export default Layout
