import { createContext } from 'react'

export const initContextVariation = { image: null, sku: null }
export const ContextVariation = createContext(initContextVariation)
