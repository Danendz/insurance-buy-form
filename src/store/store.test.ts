import { describe, expect, it } from 'vitest';
import { initialFormState, updateDetails } from '@/features/insurance-form';
import { makeStore } from './store';

describe('store', () => {
  it('persists the form, but not the API cache', () => {
    const store = makeStore();
    store.dispatch(updateDetails({ countryId: 7 }));
    const saved = Object.values({ ...sessionStorage }).map((raw) => JSON.parse(raw as string));
    expect(saved).toEqual([
      { ...initialFormState, details: { ...initialFormState.details, countryId: 7 } },
    ]);
  });
});
