import { ObjectsObject, ObjectsObjectVariation } from "~/utils/contentful"

type Reduced = Pick<ObjectsObject, 'sellOnline' | 'stock'> & {
  variationsCollection?: {
    items: Pick<ObjectsObjectVariation, 'sellOnline' | 'stock'>[]
  }
}

export const objectsReduceSell = <T = unknown>(filtered: (T & Reduced)[], item: (T & Reduced)) => {
  if (item.variationsCollection?.items.length) {
    // Count only variations
    if (
      item.variationsCollection.items.filter(
        variation => variation && variation.sellOnline && (variation.stock ?? 0 > 0)
      ).length
    ) {
      filtered.push(item)
    }
  } else {
    // Count only root object
    if (item.sellOnline && (item.stock ?? 0 > 0)) {
      filtered.push(item)
    }
  }

  return filtered
}