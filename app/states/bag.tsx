import { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { CommonImage, ObjectsArtist } from '~/utils/contentful'

type ObjectMain = {
  type: 'main'
  contentful_id: string
  contentful_id_url: string
  artist: Pick<ObjectsArtist, 'slug' | 'artist'>
  image: CommonImage | undefined | null
  priceOriginal: number
  priceSale?: number
  stock: number
  sku?: string
  amount: number
  name: { [key: string]: string }
  colour?: undefined
  size?: undefined
  variant?: undefined
}

type ObjectVariation = {
  type: 'variation'
  contentful_id: string
  contentful_id_url: string
  artist: Pick<ObjectsArtist, 'slug' | 'artist'>
  image: CommonImage | undefined | null
  priceOriginal: number
  priceSale?: number
  stock: number
  sku?: string
  amount: number
  name: { [key: string]: string }
  variant?: { [key: string]: string } | null
  colour?: { [key: string]: string } | null
  size?: { [key: string]: string } | null
}

type ObjectGiftCard = {
  type: 'giftcard'
  contentful_id: string
  contentful_id_url: string
  artist?: undefined
  image: CommonImage | undefined | null
  priceOriginal: number
  priceSale?: undefined
  stock: number
  amount: number
  name: { [key: string]: string }
  colour?: undefined
  size?: undefined
  variant?: undefined
}

export type TDObject = ObjectMain | ObjectVariation | ObjectGiftCard
export type TDDelivery =
  | {
      method: 'pickup'
      shipment: null
    }
  | {
      method: 'shipment'
      shipment: { value: string; label: string }
    }
export type BagState = {
  objects: TDObject[]
  delivery: TDDelivery
  objectsAdd: (object: TDObject) => void
  objectsRemove: (contentful_id: string) => void
  updateDeliveryMethod: (method: TDDelivery['method']) => void
  updateDeliveryShipmentCountry: (shipment: TDDelivery['shipment']) => void
}

const initBagState: BagState = {
  objects: [],
  delivery: { method: 'pickup', shipment: null },
  objectsAdd: () => {},
  objectsRemove: () => {},
  updateDeliveryMethod: () => {},
  updateDeliveryShipmentCountry: () => {}
}

export const BagContext = createContext<BagState>(initBagState)

const BagProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [objects, setObjects] = useState<TDObject[]>(initBagState.objects)
  useEffect(() => {
    const storedObjects = localStorage.getItem('objects')
    if (!storedObjects) return

    const objects = JSON.parse(storedObjects)
    if (objects) {
      setObjects(objects)
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('objects', JSON.stringify(objects))
  }, [objects])

  const [delivery, setDelivery] = useState<TDDelivery>(initBagState.delivery)
  useEffect(() => {
    const storedDelivery = localStorage.getItem('delivery')
    if (!storedDelivery) return

    const delivery = JSON.parse(storedDelivery)
    if (delivery) {
      setDelivery(delivery)
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('delivery', JSON.stringify(delivery))
  }, [delivery])

  const objectsAdd = (object: TDObject) => {
    const foundIndex = objects.findIndex(obj => obj.contentful_id === object.contentful_id)
    if (foundIndex === -1) {
      setObjects([...objects, object])
    } else {
      setObjects(objects.map((o, i) => (i === foundIndex ? object : o)))
    }
  }
  const objectsRemove = (contentful_id: string) => {
    setObjects(objects.filter(object => object.contentful_id !== contentful_id).filter(o => o))
  }

  const updateDeliveryMethod = (method: TDDelivery['method']) => {
    // @ts-ignore
    setDelivery({ ...delivery, method })
  }
  const updateDeliveryShipmentCountry = (shipment: TDDelivery['shipment']) => {
    // @ts-ignore
    setDelivery({ ...delivery, shipment })
  }

  return (
    <BagContext.Provider
      value={{
        objects,
        objectsAdd,
        objectsRemove,
        delivery,
        updateDeliveryMethod,
        updateDeliveryShipmentCountry
      }}
      children={children}
    />
  )
}

export default BagProvider
