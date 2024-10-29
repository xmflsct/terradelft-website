import { ObjectsObject, ObjectsObjectVariation } from './contentful'

export const isObjectInStock = (
  object: Pick<ObjectsObject, 'stock'> & {
    variationsCollection?: { items: (Pick<ObjectsObjectVariation, 'stock'> | null)[] }
  }
): boolean => {
  if (!!object.variationsCollection?.items.length) {
    if (
      object.variationsCollection.items.length ===
      object.variationsCollection.items.filter(i => i?.stock === 0).length
    )
      return false
  } else {
    if (object.stock === 0) return false
  }

  return true
}
