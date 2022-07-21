import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren
} from 'react'

const Button: React.FC<
  PropsWithChildren &
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
> = props => {
  return (
    <button
      className='border-2 border-secondary text-secondary font-bold rounded my-2 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-inherit disabled:hover:text-secondary hover:bg-secondary hover:text-white'
      {...props}
    />
  )
}

export default Button
