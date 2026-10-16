import { describe, expect, it } from 'vitest';
import { initialFormState, updateDetails } from '@/features/insurance-form';
import { makeStore } from './store';

describe('store', () => {
  it('persists the form, but not the API cache', () => {
    const store = makeStore();
    store.dispatch(updateDetails({ activityId: 2 }));
    const saved = Object.values({ ...localStorage }).map((raw) => JSON.parse(raw as string).state);
    expect(saved).toEqual([
      { ...initialFormState, details: { ...initialFormState.details, activityId: 2 } },
    ]);
  });
});
