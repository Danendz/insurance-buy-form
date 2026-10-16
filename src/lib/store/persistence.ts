import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { InsuranceFormState } from '@/features/insurance-form';
import type { AppDispatch, RootState } from './store';

// Bump the version when the persisted shape changes, so stale data is ignored.
export const STORAGE_KEY = 'insurance-buy-form:v1';

export type PersistedState = {
  insuranceForm: InsuranceFormState;
};

export function loadPersistedState(): PersistedState | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : undefined;
  } catch {
    return undefined;
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or disabled (private mode); persistence is best-effort.
  }
}

const listener = createListenerMiddleware();

listener.startListening.withTypes<RootState, AppDispatch>()({
  predicate: (_action, currentState, previousState) =>
    currentState.insuranceForm !== previousState.insuranceForm,
  effect: (_action, api) => {
    savePersistedState({ insuranceForm: api.getState().insuranceForm });
  },
});

export const persistenceMiddleware = listener.middleware;
