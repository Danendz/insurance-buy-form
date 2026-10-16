import { describe, expect, it } from 'vitest';
import { nextStep } from '@/features/insurance-form';
import { loadPersistedState, savePersistedState, STORAGE_KEY } from './persistence';
import { makeStore } from './store';

describe('persistence', () => {
  it('round-trips state through sessionStorage', () => {
    savePersistedState({ insuranceForm: { currentStep: 2 } });
    expect(loadPersistedState()).toEqual({ insuranceForm: { currentStep: 2 } });
  });

  it('returns undefined for missing or corrupted data', () => {
    expect(loadPersistedState()).toBeUndefined();
    sessionStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadPersistedState()).toBeUndefined();
  });

  it('saves form state when it changes', () => {
    const store = makeStore();
    store.dispatch(nextStep());
    expect(loadPersistedState()).toEqual({ insuranceForm: { currentStep: 1 } });
  });
});
