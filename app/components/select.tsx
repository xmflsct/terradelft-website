import { PropsWithChildren } from 'react'

type Props = {
  label: string
}

const Select: React.FC<PropsWithChildren & Props> = ({ label, children }) => {
  return (
    <div className='my-2 flex flex-row'>
      <span className='bg-placeholder px-4 inline-flex items-center rounded-l'>{label}</span>
      <div className='flex-1'>{children}</div>
    </div>
  )
}

export default Select
