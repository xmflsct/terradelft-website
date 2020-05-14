import PropTypes from 'prop-types'
import React, { useReducer } from 'react'

import * as storage from '../../components/utils/storage'

function reducer (state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, bag: storage.add(action.data) }
    case 'update':
      return { ...state, bag: storage.update(action.data) }
    case 'remove':
      return { ...state, bag: storage.remove(action.data) }
    case 'clear':
      return { ...state, bag: storage.clear() }
    default:
      throw new Error()
  }
}
const initContextBag = { bag: storage.check() }
export const ContextBag = React.createContext(initContextBag)

export default function ContextBagProvider ({ children }) {
  const [state, dispatch] = useReducer(reducer, initContextBag)
  return (
    <ContextBag.Provider value={{ state, dispatch }}>
      {children}
    </ContextBag.Provider>
  )
}

ContextBagProvider.propTypes = {
  children: PropTypes.elementType.isRequired
}
