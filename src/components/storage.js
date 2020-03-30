import store from "store2"
import { findIndex } from "lodash"

const storageKey = "terradelft_bag"
let storageData = store(storageKey)

export function add(data) {
  // Add or update SKUs
  const keyIndex = findIndex(storageData, ["contentful_id", data.contentful_id])
  if (keyIndex === -1) {
    // Add SKUs
    data.timestamp = new Date().getTime()
    if (storageData) {
      storageData.push(data)
    } else {
      storageData = [data]
    }
  } else {
    // Update SKUs
    storageData[keyIndex].timestamp = new Date().getTime()
    for (const key in data) {
      if (key !== "contentful_id") {
        storageData[keyIndex][key] = data[key]
      }
    }
  }
  store(storageKey, storageData)
  return storageData
}

export function remove(data) {
  // Remove SKU
  const keyIndex = findIndex(storageData, ["contentful_id", data.contentful_id])
  storageData.splice(keyIndex, 1)
  store(storageKey, storageData)
  return storageData
}

export function check() {
  const timestamp = new Date().getTime()

  // Clear outdated objects in shopping bag
  if (storageData) {
    storageData.forEach((_, i, a) => {
      // Items are saved for up to 60 minutes
      if (timestamp - storageData[i].timestamp > 60 * 60000) {
        storageData.splice(i, 1)
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
