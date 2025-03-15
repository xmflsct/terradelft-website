export const linkHref: (path: string, locale?: string) => { tagName: 'link', rel: string, hreflang?: string, href: string }[] = (path, locale) => {
  switch (locale) {
    case 'en':
      return [
        {
          tagName: "link",
          rel: 'canonical',
          href: `https://www.terra-delft.nl/en/${path}`
        },
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
        },
        {
          tagName: "link",
          rel: 'alternate',
          hreflang: 'x-default',
          href: `https://www.terra-delft.nl/en/${path}`
        }
      ]
    case 'nl':
      return [
        {
          tagName: "link",
          rel: 'canonical',
          href: `https://www.terra-delft.nl/nl/${path}`
        },
        {
          tagName: "link",
          rel: 'alternate',
          hreflang: 'nl',
          href: `https://www.terra-delft.nl/nl/${path}`
        },
        {
          tagName: "link",
          rel: 'alternate',
          hreflang: 'en',
          href: `https://www.terra-delft.nl/en/${path}`
        },
        {
          tagName: "link",
          rel: 'alternate',
          hreflang: 'x-default',
          href: `https://www.terra-delft.nl/en/${path}`
        }
      ]
    default:
      return []
  }
}