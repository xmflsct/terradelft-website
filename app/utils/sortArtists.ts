import { ObjectsArtist } from './contentful'

const sortArtists = ({
  items,
  ...rest
}: Readonly<{
  items: Readonly<ObjectsArtist[]>
}>) => {
  return {
    ...rest,
    items: [...items].sort((a, b) => Intl.Collator().compare(a.artist.match(new RegExp(/\b(\S+)\W*$/))![0], b.artist.match(new RegExp(/\b(\S+)\W*$/))![0]))
  }
}

export default sortArtists
