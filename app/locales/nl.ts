export default {
  common: {
    header: {
      'language-switcher': {
        long: {
          nl: 'Nederlands',
          en: 'English'
        },
        short: {
          nl: 'NL',
          en: 'EN'
        }
      },
      'mini-bag': 'Toegevoegd aan winkelmandje'
    },
    footer: {
      left: {
        copyright: '© Terra Delft Online 2015 - 2023',
        opening: {
          '1': 'woensdag t/m vrijdag 11 - 18 uur',
          '2': 'zaterdag 11 - 17 uur',
          '3': 'zondag 13 - 17 uur'
        }
      },
      center: {
        address: 'Nieuwstraat 7, 2611 HK Delft',
        phone: 'Tel: 015-2147072',
        email: 'Email: info@terra-delft.nl'
      }
    },
    pages: {
      '404': 'Pagina niet gevonden',
      'about-terra': 'Over Terra',
      'about-us': 'Over ons',
      artist: '{{artist}}',
      bag: 'Winkelmandje',
      exhibition: '{{exhibition}}',
      exhibitions: 'Expositie',
      exhibitions_page: 'Expositie pagina {{page}}',
      index: 'Collectie',
      news: 'Nieuws',
      news_article: '{{news}}',
      news_page: 'Nieuws pagina {{page}}',
      newsletter: 'Nieuwsbrief',
      'reach-terra': 'Bezoek Terra',
      shop: 'Web winkel',
      shop_page: 'Web winkel pagina {{page}}',
      'terra-in-china-exhibitions-page': 'Terra in China expositie pagina {{page}}',
      'terra-in-china-news-page': 'Terra in China nieuws pagina {{page}}',
      'terra-in-china': 'Terra in China',
      'gift-card': 'Terra Delft Cadeaubon',
      search: 'Zoekresultaat van {{query}}',
      'thank-you': 'Bedankt voor je bestelling!',
      'objects-attribute': 'Objecten met {{type}} over {{value}}'
    },
    'gift-card': {
      name: 'Cadeaubon',
      amount: {
        en: 'Gift Card € {{amount}}',
        nl: 'Cadeaubon € {{amount}}'
      }
    },
    'on-sale': 'Aanbieding',
    'no-image': ''
  },
  aboutTerra: {
    staff: 'Personeel'
  },
  artist: {
    'objects-by': 'Objecten door {{artist}}'
  },
  bag: {
    'list-empty': 'Het lijkt erop dat je boodschappentas leeg is.',
    'delivery-method': 'Leveringsmethode',
    'phone-number': 'Telefoonnummer',
    summary: 'Samenvatting',
    'pick-up': 'Afhalen bij Galerie Terra Delft',
    shipping: 'Verzending naar',
    'select-country': 'Selecteer land',
    'free-for-above': 'Gratis voor boven ',
    free: 'Gratis',
    subtotal: 'Subtotaal',
    discount: 'Korting',
    'delivery-fee': 'Verzendkosten',
    total: 'Totaal',
    button: {
      submit: 'Uitchecken',
      retry: 'Probeer het alstublieft opnieuw',
      wait: 'Wacht alsjeblieft'
    }
  },
  china: {
    heading: {
      events: '$t(common:pages.exhibitions)',
      news: '$t(common:pages.news)'
    },
    'view-all': {
      events: 'Bekijk al het exposities van Terra in China →',
      news: 'Bekijk al het nieuws van Terra in China →'
    }
  },
  exhibition: {
    current: 'Nu',
    upcoming: 'Verwacht',
    archive: 'Archief →',
    datetime: {
      Start: 'Begint {{datetime}}',
      End: 'Eindigt {{datetime}}'
    },
    organizer: 'Organisator',
    location: 'Locatie'
  },
  giftCard: {
    amount: 'Cadeaubon € {{amount}}',
    minimum: 'Minimaal € {{amount}}'
  },
  index: {
    'online-shop': 'Web Winkel',
    collection: 'Collectie',
    newsletter: 'Abonneer op onze nieuwsbrief'
  },
  news: {
    published: 'Gepubliceerd op {{date}}'
  },
  newsletter: {
    heading: 'Schrijf je in voor de nieuwsbrief van Terra Delft',
    description:
      'Bedankt voor het abonneren op onze nieuwsbrief. Vul dan onderstaand formulier in.',
    'first-name': 'Voornaam',
    'last-name': 'Achternaam',
    email: 'E-mailadres',
    country: 'Land/Regio',
    GDPR: 'Ja, ik accepteer dat Terra Delft met mijn gegevens omgaat',
    button: {
      default: 'Inschrijven',
      submitting: 'Wacht alsjeblieft',
      success: 'Heel hartelijk bedankt!',
      fail: 'Probeer het opnieuw of neem contact met ons op'
    }
  },
  object: {
    'option-default': 'Normaal',
    artist: 'Kunstenaar',
    variant: 'Variant',
    colour: 'Kleur',
    size: 'Afmeting',
    year: 'Jaar',
    technique: 'Techniek',
    material: 'Materiaal',
    dimensionWidth: 'Breedte',
    dimensionLength: 'Lengte',
    dimensionHeight: 'Hoogte',
    dimensionDiameter: 'Diameter',
    dimensionDepth: 'Diepte',
    amount: 'Aantal',
    price: 'Prijs',
    'out-of-stock': 'Verkocht',
    'add-to-bag': 'In winkelmand',
    'select-variation': 'Selecteer opties',
    contact: {
      button: 'Vraag over dit object?',
      form: {
        subject: {
          label: 'Onderwerpen',
          value: 'Vraag over {{name}}'
        },
        name: {
          label: 'Naam'
        },
        email: {
          label: 'E-mailadres'
        },
        question: {
          label: 'Vraag'
        },
        GDPR: {
          label: 'Ja, ik accepteer dat Terra Delft met mijn gegevens omgaat'
        },
        button: {
          default: 'Sturen',
          submitting: 'Wacht alsjeblieft',
          success: 'Dank u! We nemen spoedig contact met u op'
        }
      }
    },
    related: 'Andere objecten door {{artist}}'
  },
  search: {
    heading: 'Zoekresultaat van {{query}}',
    summary: '{{total}} resultaten gevonden, top {{count}} resultaten weergegeven'
  },
  shop: {
    filters: 'Filtreren',
    prices: 'Prijs',
    artists: 'Kunstenaar',
    variants: 'Variant',
    colours: 'kleur'
  },
  thankYou: {
    heading: 'Bedankt voor je bestelling!',
    content:
      'U zou een ontvangstbewijs in uw e-mail moeten hebben ontvangen. We laten het u weten zodra uw bestelling is afgehandeld.'
  }
}
