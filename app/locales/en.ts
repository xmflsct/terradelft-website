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
      'mini-bag': 'Added to shopping bag'
    },
    footer: {
      left: {
        copyright: '© Terra Delft Online 2015 - 2023',
        opening: {
          '1': 'Wednesday to Friday 11.00 - 18.00',
          '2': 'Saturday 11.00 - 17.00',
          '3': 'Sunday 13.00 - 17.00'
        }
      },
      center: {
        address: 'Nieuwstraat 7, 2611 HK Delft',
        phone: 'Tel: 015-2147072',
        email: 'Email: info@terra-delft.nl'
      }
    },
    pages: {
      '404': 'Page not found',
      'about-terra': 'About Terra',
      'about-us': 'About us',
      artist: '{{artist}}',
      bag: 'Shopping bag',
      exhibition: '{{exhibition}}',
      exhibitions: 'Exhibitions',
      exhibitions_page: 'Exhibitions page {{page}}',
      index: 'Collection',
      news: 'News',
      news_article: '{{news}}',
      news_page: 'News page {{page}}',
      newsletter: 'Newsletter',
      'reach-terra': 'Reach Terra',
      shop: 'Online shop',
      shop_page: 'Online shop page {{page}}',
      'terra-in-china-exhibitions-page': 'Terra in China exhibitions page {{page}}',
      'terra-in-china-news-page': 'Terra in China news page {{page}}',
      'terra-in-china': 'Terra in China',
      'gift-card': 'Terra Delft Gift Card',
      search: 'Search result of {{query}}',
      'thank-you': 'Thank you for your order!',
      'objects-attribute': 'Objects with {{type}} of {{value}}'
    },
    'gift-card': {
      name: 'Gift Card',
      amount: {
        en: 'Gift Card € {{amount}}',
        nl: 'Cadeaubon € {{amount}}'
      }
    },
    'on-sale': 'Sale',
    'no-image': ''
  },
  aboutTerra: {
    staff: 'Staff'
  },
  artist: {
    'objects-by': 'Objects by {{artist}}'
  },
  bag: {
    'list-empty': 'Seems like your shopping bag is empty.',
    'delivery-method': 'Delivery method',
    'phone-number': 'Phone number',
    summary: 'Summary',
    'pick-up': 'Pick up at Terra Delft Gallery',
    shipping: 'Ship to',
    'select-country': 'Select country',
    'free-for-above': 'Free for above {{amount}}',
    free: 'Free',
    subtotal: 'Subtotal',
    discount: 'Discount',
    'delivery-fee': 'Delivery fee',
    total: 'Total',
    button: {
      submit: 'Checkout',
      retry: 'Please try again',
      wait: 'Please wait'
    }
  },
  china: {
    heading: {
      events: '$t(common:pages.exhibitions)',
      news: '$t(common:pages.news)'
    },
    'view-all': {
      events: 'View all events of Terra in China →',
      news: 'View all news of Terra in China →'
    }
  },
  exihibition: {
    current: 'Now',
    upcoming: 'Coming Up',
    archive: 'Archive →',
    datetime: {
      Start: 'Starts {{datetime}}',
      End: 'Ends {{datetime}}'
    },
    organizer: 'Organizer',
    location: 'Location'
  },
  giftCard: {
    amount: 'Gift Card € {{amount}}',
    minimum: 'Minimum € {{amount}}'
  },
  index: {
    'online-shop': 'Online Shop',
    collection: 'Collection',
    newsletter: 'Subscribe to our newsletter'
  },
  news: {
    published: 'Published on {{date}}'
  },
  newsletter: {
    heading: "Subscribe to Terra Delft's newsletter",
    description: 'Thank you for subscribing to our newsletter. Please fill out the form below.',
    'first-name': 'First name',
    'last-name': 'Last name',
    email: 'Email address',
    country: 'Country / region',
    GDPR: 'Yes, I accept that Terra Delft handles my information',
    button: {
      default: 'Subscribe',
      submitting: 'Please wait',
      success: 'Thank you for subscribing!',
      fail: 'Please try again or contact us'
    }
  },
  object: {
    'option-default': 'Normal',
    artist: 'Artist',
    variant: 'Variant',
    colour: 'Colour',
    size: 'Size',
    year: 'Year',
    technique: 'Technique',
    material: 'Material',
    dimensionWidth: 'Width',
    dimensionLength: 'Length',
    dimensionHeight: 'Height',
    dimensionDiameter: 'Diameter',
    dimensionDepth: 'Depth',
    amount: 'Amount',
    price: 'Price',
    'out-of-stock': 'Sold',
    'add-to-bag': 'Add to bag',
    'select-variation': 'Select options',
    contact: {
      button: 'Question about this object?',
      form: {
        subject: {
          label: 'Subject',
          value: 'Inquiry about {{- name}}'
        },
        name: {
          label: 'Name'
        },
        email: {
          label: 'Email address'
        },
        question: {
          label: 'Question'
        },
        GDPR: {
          label: 'Yes, I accept that Terra Delft handles my information'
        },
        button: {
          default: 'Send inquiry',
          submitting: 'Please wait',
          success: 'Thank you! We will contact you shortly'
        }
      }
    },
    related: 'Other objects by {{artist}}'
  },
  esearch: {
    heading: 'Search result of {{query}}',
    summary: 'Found {{total}} results, showing top {{count}} results'
  },
  shop: {
    filters: 'Filters',
    prices: 'Price',
    artists: 'Artist',
    variants: 'Variant',
    colours: 'Colour'
  },
  thankYou: {
    heading: 'Thank you for your order!',
    content:
      'You should have received a receipt in your email. We will let you know once your order has been handled.'
  }
}
