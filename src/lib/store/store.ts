import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { insuranceFormSlice } from '@/features/insurance-form';
import { persistenceMiddleware } from './persistence';

const rootReducer = combineSlices(insuranceFormSlice);

export type RootState = ReturnType<typeof rootReducer>;

// A new store per request: module-level stores would leak state between users on the server.
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistenceMiddleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
