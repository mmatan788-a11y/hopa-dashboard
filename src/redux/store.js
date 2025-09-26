
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
};

const initialState = {
  searchQuery: '',
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'search/setQuery':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const setSearchQuery = (query) => ({ type: 'search/setQuery', payload: query });
