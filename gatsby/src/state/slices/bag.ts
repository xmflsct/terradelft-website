import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { findIndex } from 'lodash'
import { RootState } from '../store'

type ObjectMain = {
  type: 'main'
  contentful_id: string
  contentful_id_url: string
  artist: string
  image: any
  priceOriginal: number
  priceSale?: number
  stock: number
  sku: string
  amount: number
  name: { nl: string; en: string }
}

type ObjectVariation = {
  type: 'variation'
  contentful_id: string
  contentful_id_url: string
  artist: string
  image: any
  priceOriginal: number
  priceSale?: number
  stock: number
  sku: string
  amount: number
  name: { nl: string; en: string }
  colour?: { nl: string; en: string }
  size?: { nl: string; en: string }
  variant?: { nl: string; en: string }
}

export type TDObject = ObjectMain | ObjectVariation

export type BagState = {
  timestamp: number
  objects: TDObject[]
  delivery: {
    method: 'pickup' | 'shipment'
    shipment: {
      country?: { value: string; label: string }
      method?: number
    }
    phone?: string
  }
}

export const bagInitialState: BagState = {
  timestamp: new Date().getTime(),
  objects: [],
  delivery: {
    method: 'pickup',
    shipment: {
      country: null,
      method: null
    },
    phone: null
  }
}

const bagSlice = createSlice({
  name: 'bag',
  initialState: bagInitialState,
  reducers: {
    bagClear: state => {
      state.objects = []
    },
    bagAdd: (state, action: PayloadAction<TDObject>) => {
      const foundIndex = findIndex(state.objects, [
        'contentful_id',
        action.payload.contentful_id
      ])
      if (foundIndex === -1) {
        state.objects.push(action.payload)
      } else {
        state.objects[foundIndex] = action.payload
      }
    },
    bagRemove: (state, action: PayloadAction<{ contentful_id: string }>) => {
      const foundIndex = findIndex(state.objects, [
        'contentful_id',
        action.payload.contentful_id
      ])
      if (foundIndex !== -1) {
        state.objects.splice(foundIndex, 1)
      }
    },
    updateDeliveryMethod: (
      state,
      action: PayloadAction<BagState['delivery']['method']>
    ) => {
      state.delivery.method = action.payload
    },
    updateDeliveryPhone: (
      state,
      action: PayloadAction<BagState['delivery']['phone']>
    ) => {
      state.delivery.phone = action.payload
    },
    updateDeliveryShippingCountry: (
      state,
      action: PayloadAction<BagState['delivery']['shipment']['country']>
    ) => {
      state.delivery.shipment.country = action.payload
    },
    updateDeliveryShippingMethod: (
      state,
      action: PayloadAction<BagState['delivery']['shipment']['method']>
    ) => {
      state.delivery.shipment.method = action.payload
    }
  }
})

export const getBag = (state: RootState) => state.bag.objects

export const getDeliveryMethod = (state: RootState) => state.bag.delivery.method
export const getDeliveryPhone = (state: RootState) => state.bag.delivery.phone
export const getDeliveryShippingCountry = (state: RootState) =>
  state.bag.delivery.shipment.country
export const getDeliveryShippingMethod = (state: RootState) =>
  state.bag.delivery.shipment.method

export const {
  bagClear,
  bagAdd,
  bagRemove,
  updateDeliveryMethod,
  updateDeliveryPhone,
  updateDeliveryShippingCountry,
  updateDeliveryShippingMethod
} = bagSlice.actions
export default bagSlice.reducer
