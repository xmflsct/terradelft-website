import {
  configureStore,
  combineReducers,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import bagSlice from './slices/bag'

const prefix = 'terradelft'

const bagPersistConfig = {
  key: 'bag',
  prefix,
  storage: storage
}

const rootPersistConfig = {
  key: 'root',
  prefix,
  storage: storage
}

const rootReducer = combineReducers({
  bag: persistReducer(bagPersistConfig, bagSlice)
})

const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST']
    }
  })
})

const persistor = persistStore(store)

export { persistor, store }
export type RootState = ReturnType<typeof store.getState>
