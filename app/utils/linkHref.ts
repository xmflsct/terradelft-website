export const linkHref: (path: string) => { tagName: 'link', rel: string, hreflang: 'en' | 'nl', href: string }[] = (path) => {
  return [
    {
      tagName: "link",
      rel: 'alternate',
      hreflang: 'en',
      href: `https://www.terra-delft.nl/en/${path}`
    },
    {
      tagName: "link",
      rel: 'alternate',
      hreflang: 'nl',
      href: `https://www.terra-delft.nl/nl/${path}`
    }
  ]
}