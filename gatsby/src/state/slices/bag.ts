import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { findIndex } from 'lodash'
import { RootState } from '../store'

type ObjectMain = {
  type: 'main'
  gatsbyPath: string
  contentful_id: string
  contentful_id_url: string
  artist: { gatsbyPath: string; name: string }
  image: any
  priceOriginal: number
  priceSale?: number
  stock: number
  sku: string
  amount: number
  name: { nl: string; en: string }
  colour?: undefined
  size?: undefined
  variant?: undefined
}

type ObjectVariation = {
  type: 'variation'
  gatsbyPath: string
  contentful_id: string
  contentful_id_url: string
  artist: { gatsbyPath: string; name: string }
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
  buildTime: number
  objects: TDObject[]
  delivery: {
    method: 'pickup' | 'shipment'
    shipment: {
      country?: { value: string; label: string }
    }
  }
}

export const bagInitialState: BagState = {
  buildTime: 0,
  objects: [],
  delivery: {
    method: 'pickup',
    shipment: {
      country: undefined
    }
  }
}

const bagSlice = createSlice({
  name: 'bag',
  initialState: bagInitialState,
  reducers: {
    bagReset: (state, action: PayloadAction<BagState['buildTime']>) => {
      state.buildTime = action.payload
      state.objects = bagInitialState.objects
      state.delivery = bagInitialState.delivery
    },
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
    updateDeliveryShippingCountry: (
      state,
      action: PayloadAction<BagState['delivery']['shipment']['country']>
    ) => {
      state.delivery.shipment.country = action.payload
    }
  }
})

export const getBuildTime = (state: RootState) => state.bag.buildTime

export const getBag = (state: RootState) => state.bag.objects

export const getDeliveryMethod = (state: RootState) => state.bag.delivery.method
export const getDeliveryShippingCountry = (state: RootState) =>
  state.bag.delivery.shipment.country

export const {
  bagReset,
  bagClear,
  bagAdd,
  bagRemove,
  updateDeliveryMethod,
  updateDeliveryShippingCountry
} = bagSlice.actions
export default bagSlice.reducer
