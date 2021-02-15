import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import LanguageContextProvider from './src/layouts/contexts/language'
import { persistor, store } from './src/state/store'
import './src/styles/main.scss'

export const wrapRootElement = ({ element }) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} children={element} />
    </Provider>
  )
}
export const wrapPageElement = LanguageContextProvider
