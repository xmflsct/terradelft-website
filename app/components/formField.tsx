import { PropsWithChildren } from 'react'

type Props = {
  type?: 'vertical' | 'horizontal'
  label: string
}

const FormField: React.FC<PropsWithChildren & Props> = ({
  type = 'horizontal',
  label,
  children
}) => {
  switch (type) {
    case 'horizontal':
      return (
        <div className='h-10 my-4 flex flex-row items-stretch'>
          <span className='bg-stone-200 px-4 inline-flex items-center rounded-l'>{label}</span>
          <div className='flex-1 flex flex-row justify-items-stretch'>{children}</div>
        </div>
      )
    case 'vertical':
      return (
        <div className='my-4 flex flex-col'>
          <span>{label}</span>
          <div className='h-10 flex-1 flex flex-row justify-items-stretch'>{children}</div>
        </div>
      )
  }
}

export default FormField
