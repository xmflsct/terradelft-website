import React from 'react'
import BagProvider from '~/states/bag'
import BagAnimate from './bagAnimate'
import Footer from './footer'
import Header from './header'

const Layout: React.FC<React.PropsWithChildren> = props => {
  return (
    <BagProvider>
      <BagAnimate />
      <div className='max-w-5xl m-0 lg:mx-auto lg:my-8 py-0 px-4 lg:p-8 lg:border lg:border-secondary'>
        <Header />
        <main className='my-4' {...props} />
        <Footer />
      </div>
    </BagProvider>
  )
}

export default Layout
