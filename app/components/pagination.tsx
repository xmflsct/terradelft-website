import { faAngleLeft, faAngleRight, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from '~/utils/classNames'
import { Link } from './link'

type Props = {
  basePath: string
  page: number
  total: number
}

const Pagination: React.FC<Props> = ({ basePath, page, total }) => {
  const active =
    'border-2 border-secondary text-secondary font-bold rounded my-2 px-4 py-2 hover:bg-secondary hover:text-white hover:no-underline'
  const inactive =
    'text-secondary font-bold rounded my-2 px-4 py-2 hover:bg-secondary hover:text-white hover:no-underline'
  const disabled =
    'text-disabled font-bold rounded my-2 px-4 py-2 cursor-not-allowed opacity-50 hover:bg-inherit hover:text-disabled hover:bg-secondary hover:text-white hover:no-underline'

  return (
    <div className='flex flex-row gap-2 justify-center items-center mt-4'>
      {page === 1 ? (
        <span className={disabled}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </span>
      ) : (
        <Link
          to={`${basePath}/${page - 1}`}
          children={<FontAwesomeIcon icon={faAngleLeft} />}
          className={inactive}
        />
      )}
      {page > 2 ? (
        <>
          <Link
            to={`${basePath}/1`}
            children='1'
            className={classNames(inactive, 'hidden lg:block')}
          />
          {page > 3 ? <FontAwesomeIcon icon={faEllipsis} className='text-disabled' /> : null}
        </>
      ) : null}
      {Array(3)
        .fill(undefined)
        .map((_, idx) => (page - 2 < 1 ? 1 : page - 1) + idx)
        .filter(i => i > 0 && i <= total)
        .map(i => (
          <Link
            key={i}
            to={`${basePath}/${i}`}
            children={i}
            className={page === i ? active : inactive}
          />
        ))}
      {total - page > 3 ? (
        <>
          {total - page > 4 ? (
            <FontAwesomeIcon icon={faEllipsis} className='text-disabled' />
          ) : null}
          <Link
            to={`${basePath}/${total}`}
            children={total}
            className={classNames(inactive, 'hidden lg:block')}
          />
        </>
      ) : null}
      {page === total ? (
        <span className={disabled}>
          <FontAwesomeIcon icon={faAngleRight} />
        </span>
      ) : (
        <Link
          to={`${basePath}/${page + 1}`}
          children={<FontAwesomeIcon icon={faAngleRight} />}
          className={inactive}
        />
      )}
    </div>
  )
}

export default Pagination
