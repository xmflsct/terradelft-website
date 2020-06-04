import store from 'store2'
import { findIndex } from 'lodash'

const storageKey = 'terradelft_bag'
const storageVer = '200603'
let storageData = store(storageKey)

export function add (data) {
  const objectIndex = findIndex(storageData.objects, [
    'contentful_id',
    data.contentful_id
  ])
  if (objectIndex === -1) {
    storageData.objects.push(data)
  } else {
    storageData.objects[objectIndex] = data
  }
  store(storageKey, storageData)
  return storageData
}

export function update (data) {
  const objectIndex = findIndex(storageData.objects, [
    'contentful_id',
    data.contentful_id
  ])
  if (objectIndex !== -1) {
    // for (const key in data) {
    //   key !== 'contentful_id' &&
    //     (storageData.objects[objectIndex][key] = data[key])
    // }
    storageData.objects[objectIndex] = data
  }
  store(storageKey, storageData)
  return storageData
}

export function remove (data) {
  const objectIndex = findIndex(storageData.objects, [
    'contentful_id',
    data.contentful_id
  ])
  if (objectIndex !== -1) {
    storageData.objects.splice(objectIndex, 1)
    store(storageKey, storageData)
  }
  return storageData
}

export function clear () {
  const timestamp = new Date().getTime()
  storageData = { objects: [], timestamp: timestamp, version: storageVer }
  store(storageKey, storageData)
  return storageData
}

export function check () {
  const timestamp = new Date().getTime()

  if (storageData) {
    if (
      timestamp - storageData.timestamp > 60 * 60000 ||
      storageVer !== storageData.version
    ) {
      storageData = { objects: [], timestamp: timestamp, version: storageVer }
    } else {
      storageData.timestamp = timestamp
    }
  } else {
    storageData = { objects: [], timestamp: timestamp, version: storageVer }
  }
  store(storageKey, storageData)
  return storageData
}
