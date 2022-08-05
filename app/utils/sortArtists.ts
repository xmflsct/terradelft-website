import { sortBy } from 'lodash'
import { ObjectsArtist } from './contentful'

const sortArtists = ({
  items,
  ...rest
}: Readonly<{
  items: Readonly<ObjectsArtist[]>
}>) => {
  return {
    ...rest,
    items: sortBy(
      items,
      ({ artist }) => artist.match(new RegExp(/\b(\w+)\W*$/))![0]
    )
  }
}

export default sortArtists
