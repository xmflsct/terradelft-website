import store from "store2"
import { findIndex } from "lodash"

const storageKey = "terradelft_bag"

export function storageAdd(data) {
  var storageData = store(storageKey)

  // Add or update SKUs
  const keyIndex = findIndex(storageData, ["sku", data.sku]) === -1
  if (keyIndex) {
    // Add SKUs
    data.timestamp = new Date().getTime()
    if (storageData) {
      storageData.push(data)
    } else {
      storageData = [data]
    }
  } else {
    // Update SKUs
    data.timestamp = new Date().getTime()
    storageData.pop(keyIndex)
    storageData.push(data)
  }
  store(storageKey, storageData)
  return storageData
}

export function storageRemove(data) {
  var storageData = store(storageKey)

  // Remove SKU
  const keyIndex = findIndex(storageData, ["sku", data]) === -1
  // Remove SKU
  storageData.pop(keyIndex)
  store(storageKey, storageData)
  return storageData
}

export function storageCheck() {
  var storageData = store(storageKey)
  const timestamp = new Date().getTime()

  // Clear outdated objects in shopping bag
  if (storageData) {
    storageData.forEach((_, i, a) => {
      // Items are saved for up to 60 minutes
      if (timestamp - storageData[i].timestamp > 60 * 60000) {
        storageData.pop(i)
      } else {
        storageData[i].timestamp = new Date().getTime()
      }
    })
  } else {
    storageData = []
  }
  store(storageKey, storageData)
  return storageData
}
