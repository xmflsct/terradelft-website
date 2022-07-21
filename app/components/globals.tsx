import { PropsWithChildren } from 'react'

const H1: React.FC<PropsWithChildren> = props => {
  return <h1 className='text-3xl mb-2' {...props} />
}
const H2: React.FC<PropsWithChildren> = props => {
  return <h1 className='text-2xl mb-2' {...props} />
}
const H3: React.FC<PropsWithChildren> = props => {
  return <h1 className='text-xl mb-2' {...props} />
}
const H4: React.FC<PropsWithChildren> = props => {
  return <h1 className='text-lg mb-1' {...props} />
}
const H5: React.FC<PropsWithChildren> = props => {
  return <h1 className='text-lg font-bold mb-1' {...props} />
}
const H6: React.FC<PropsWithChildren> = props => {
  return <h1 className='font-bold mb-1' {...props} />
}

export { H1, H2, H3, H4, H5, H6 }
