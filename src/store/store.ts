import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { insuranceFormPersistence, insuranceFormSlice } from '@/features/insurance-form';
import { baseApi } from '@/shared/api/baseApi';

const rootReducer = combineSlices(insuranceFormSlice, baseApi);

export const persistences = [insuranceFormPersistence];

export type RootState = ReturnType<typeof rootReducer>;

// A new store per request: a module-level store would leak state between users on the server.
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(persistences.map((persistence) => persistence.middleware))
        .concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
