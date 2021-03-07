import { createContext } from 'react'

const initContextVariation = { image: null, sku: null }

const ContextVariation = createContext(initContextVariation)

export { ContextVariation, initContextVariation }
