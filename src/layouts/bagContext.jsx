import React, { useReducer } from "react"

import * as storage from "./storage"

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return {...state, bag: storage.add(action.data)}
    case "remove":
      return {...state, bag: storage.remove(action.data)}
    default:
      throw new Error()
  }
}
const initBagContext = { bag: storage.check() }
export const BagContext = React.createContext(initBagContext)

export default function BagContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initBagContext)
  return (
    <BagContext.Provider value={{ state, dispatch }}>
      {children}
    </BagContext.Provider>
  )
}
