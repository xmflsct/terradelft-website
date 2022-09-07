import { PropsWithChildren } from 'react'

type Props = PropsWithChildren & { className?: string }

const H1: React.FC<Props> = props => {
  return <h1 className={`text-3xl mb-4 ${props.className}`} children={props.children} />
}
const H2: React.FC<Props> = props => {
  return <h2 className={`text-2xl mb-4 ${props.className}`} children={props.children} />
}
const H3: React.FC<Props> = props => {
  return <h3 className={`text-xl mb-2 ${props.className}`} children={props.children} />
}
const H4: React.FC<Props> = props => {
  return <h4 className={`text-lg mb-1 ${props.className}`} children={props.children} />
}
const H5: React.FC<Props> = props => {
  return <h5 className={`text-lg font-bold mb-1 ${props.className}`} children={props.children} />
}
const H6: React.FC<Props> = props => {
  return <h6 className={`font-bold mb-1 ${props.className}`} children={props.children} />
}

export { H1, H2, H3, H4, H5, H6 }
