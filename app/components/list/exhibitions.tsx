import { EventsEvent } from '~/utils/contentful'
import ExhibitionInformation from '../exhibition/information'
import ContentfulImage from '../image'
import { Link } from '../link'

type Props = {
  exhibitions: Pick<
    EventsEvent,
    'sys' | 'name' | 'image' | 'datetimeStart' | 'datetimeEnd'
  >[]
}

const ListExhibitions: React.FC<Props> = ({ exhibitions }) => {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8'>
      {exhibitions?.map(exhibition => {
        return (
          <div key={exhibition.sys.id}>
            <Link to={`/exhibition/${exhibition.sys.id}`}>
              <ContentfulImage
                alt={exhibition.name}
                image={exhibition.image}
                width={309}
                height={309}
                quality={80}
                behaviour='fill'
                focusArea='faces'
                className='mb-2'
              />
              <p className='text-lg truncate mt-1'>{exhibition.name}</p>
            </Link>
            <ExhibitionInformation exhibition={exhibition} />
          </div>
        )
      })}
    </div>
  )
}

export default ListExhibitions
