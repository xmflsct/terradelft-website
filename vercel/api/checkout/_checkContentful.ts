import axios from 'axios'
import { findIndex, sumBy } from 'lodash'
import { CheckoutRequest } from '../checkout'

const checkContentful = async ({
  body: { objects, delivery, amounts, locale }
}: CheckoutRequest) => {
  if (
    objects.length === 0 ||
    Object.keys(delivery).length === 0 ||
    Object.keys(amounts).length === 0
  ) {
    return {
      success: false,
      error: '[checkout - checkContentful] Content empty'
    }
  }

  const corrections = {
    objects: [],
    amounts: { subtotal: undefined, delivery: undefined }
  }

  const space = process.env.CONTENTFUL_OBJECTS_SPACE
  const secret = process.env.CONTENTFUL_OBJECTS_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_OBJECTS_ENVIRONMENT
  const url =
    'https://' +
    process.env.CONTENTFUL_HOST +
    '/spaces/' +
    space +
    '/environments/' +
    environment +
    '/entries/'
  const contentType = {
    main: 'objectsObject',
    variation: 'objectsObjectVariation',
    delivery: 'shippingRates'
  }

  // Check objects
  const tempIds = { main: [], variation: [] }
  const ids = { main: undefined, variation: undefined }
  for (const object of objects) {
    object.type === 'main'
      ? tempIds.main.push(object.contentful_id)
      : tempIds.variation.push(object.contentful_id)
  }
  tempIds.main.length && (ids.main = tempIds.main.join(','))
  tempIds.variation.length && (ids.variation = tempIds.variation.join(','))

  for (const type in ids) {
    if (ids[type] && ids[type].length) {
      const response = await axios({
        method: 'get',
        url,
        params: {
          access_token: secret,
          content_type: contentType[type],
          select: 'sys.id,fields.stock,fields.priceOriginal,fields.priceSale',
          'sys.id[in]': ids[type]
        }
      }).then(res => res.data)

      if (!response.hasOwnProperty('items')) {
        return {
          success: false,
          error: '[checkout - checkContentful] Content error'
        }
      }

      for (const item of response.items) {
        let objectIndex = objects.findIndex(
          i => i.contentful_id === item.sys.id
        )
        const correction = {
          required: false,
          contentful_id: undefined,
          priceOriginal: undefined,
          priceSale: undefined,
          stock: undefined
        }

        if (item.fields.stock < 1) {
          correction.required = true
          correction.stock = 0
        }
        if (
          !(objects[objectIndex].priceOriginal === item.fields.priceOriginal)
        ) {
          correction.required = true
          correction.priceOriginal = item.fields.priceOriginal
        }
        if (!(objects[objectIndex].priceSale == item.fields.priceSale)) {
          correction.required = true
          correction.priceSale = item.fields.priceSale
            ? item.fields.priceSale
            : null
        }

        if (correction.required) {
          delete correction.required
          correction.contentful_id = item.sys.id
          corrections.objects.push(correction)
        }
      }
    }
  }

  // Check delivery
  if (delivery.method !== 'pickup') {
    const response = await axios({
      method: 'get',
      url,
      params: {
        access_token: secret,
        content_type: contentType.delivery,
        select: 'fields.rates',
        'fields.year[eq]': '2020',
        locale: locale
      }
    }).then(res => res.data)

    if (!response.hasOwnProperty('items')) {
      return {
        success: false,
        error: '[checkout - checkContentful] Content error'
      }
    }

    const rates = response.items[0].fields.rates

    let countryCodeIndex = findIndex(rates, rate =>
      // @ts-ignore
      rate.countryCode.includes(delivery.countryCode)
    )
    countryCodeIndex =
      countryCodeIndex !== -1 ? countryCodeIndex : rates.length - 1

    if (rates[countryCodeIndex].rates[delivery.index].freeForTotal) {
      if (
        amounts.subtotal <
          rates[countryCodeIndex].rates[delivery.index].freeForTotal &&
        amounts.delivery === 0
      ) {
        corrections.amounts.delivery =
          rates[countryCodeIndex].rates[delivery.index].price
      }
    } else {
      if (
        !(amounts.delivery === rates[countryCodeIndex].rates[delivery.index].price)
      ) {
        corrections.amounts.delivery =
          rates[countryCodeIndex].rates[delivery.index].price
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(objects, o => {
    return o.priceOriginal * o.amount
  })
  if (!(subtotal === amounts.subtotal)) {
    corrections.amounts.subtotal = subtotal
  }

  if (
    corrections.objects.length ||
    corrections.amounts.subtotal ||
    corrections.amounts.delivery
  ) {
    console.log('no', corrections)
    return { success: false, corrections }
  } else {
    console.log('yes')
    return { success: true }
  }
}

export default checkContentful
