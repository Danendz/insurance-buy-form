import { describe, expect, it } from 'vitest';
import type { InsuranceFormState } from '../../types';
import {
  goToDetails,
  hydrate,
  initialState,
  insuranceFormSlice,
  orderPlaced,
  phoneValidityChanged,
  reset,
  selectProgram,
  startDatePrefilled,
  submitDetails,
  updateDetails,
} from './slice';

const reducer = insuranceFormSlice.reducer;
const TODAY = '2024-09-05';

const filled: InsuranceFormState = {
  ...initialState,
  details: {
    countryId: 1,
    coverageType: 'single',
    startDate: '2024-09-05',
    endDate: '2024-09-12',
    activityId: 0,
    phone: '+998901234567',
  },
};

describe('insuranceForm slice', () => {
  it('starts on the details step with an empty form', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    expect(initialState.step).toBe('details');
  });

  it('prefills the start date only on a pristine form', () => {
    expect(reducer(initialState, startDatePrefilled(TODAY)).details.startDate).toBe(TODAY);

    const touched = reducer(initialState, updateDetails({ activityId: 1 }));
    expect(reducer(touched, startDatePrefilled(TODAY)).details.startDate).toBeNull();

    const submitted = reducer(initialState, submitDetails(TODAY));
    expect(reducer(submitted, startDatePrefilled(TODAY)).details.startDate).toBeNull();
  });

  it('merges detail updates', () => {
    const state = reducer(initialState, updateDetails({ coverageType: 'multi', activityId: 2 }));
    expect(state.details).toMatchObject({ coverageType: 'multi', activityId: 2, countryId: null });
  });

  it('forgets the chosen program when the country changes', () => {
    const withProgram = { ...filled, programId: 3 };
    expect(reducer(withProgram, updateDetails({ countryId: 1 })).programId).toBe(3);
    expect(reducer(withProgram, updateDetails({ countryId: 2 })).programId).toBeNull();
  });

  it('stays on details and flags errors when submitting an invalid form', () => {
    const state = reducer(initialState, submitDetails(TODAY));
    expect(state).toMatchObject({ step: 'details', submitAttempted: true });
  });

  it('moves to the program step when the details are valid', () => {
    expect(reducer(filled, submitDetails(TODAY)).step).toBe('program');
  });

  it('stays on details when the phone field reported an invalid number', () => {
    const state = reducer(filled, phoneValidityChanged(false));
    expect(reducer(state, submitDetails(TODAY)).step).toBe('details');
  });

  it('goes back to details, keeping the answers', () => {
    const state = reducer({ ...filled, step: 'program' }, goToDetails());
    expect(state).toEqual({ ...filled, step: 'details' });
  });

  it('selects a program and completes the order', () => {
    let state = reducer({ ...filled, step: 'program' }, selectProgram(3));
    expect(state.programId).toBe(3);
    state = reducer(state, orderPlaced('order-1'));
    expect(state).toMatchObject({ step: 'done', orderId: 'order-1' });
  });

  it('resets to the initial state', () => {
    expect(reducer({ ...filled, step: 'done', orderId: 'x' }, reset())).toEqual(initialState);
  });

  it('replaces state on hydrate', () => {
    expect(reducer(initialState, hydrate(filled))).toEqual(filled);
  });
});
