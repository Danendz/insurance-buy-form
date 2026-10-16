import { describe, expect, it } from 'vitest';
import type { InsuranceFormState } from '../../types';
import {
  countryAdded,
  countryChanged,
  countryRemoved,
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
    countryIds: [1],
    coverageType: 'single',
    startDate: '2024-09-05',
    endDate: '2024-09-12',
    activityId: 0,
    phone: '+998901234567',
  },
};

describe('insuranceForm slice', () => {
  it('prefills the start date only on a pristine form', () => {
    expect(reducer(initialState, startDatePrefilled(TODAY)).details.startDate).toBe(TODAY);

    const touched = reducer(initialState, updateDetails({ activityId: 1 }));
    expect(reducer(touched, startDatePrefilled(TODAY)).details.startDate).toBeNull();

    const submitted = reducer(initialState, submitDetails(TODAY));
    expect(reducer(submitted, startDatePrefilled(TODAY)).details.startDate).toBeNull();
  });

  it('merges detail updates', () => {
    const state = reducer(initialState, updateDetails({ coverageType: 'multi', activityId: 2 }));
    expect(state.details).toMatchObject({
      coverageType: 'multi',
      activityId: 2,
      countryIds: [null],
    });
  });

  it('prefills the start date after a country row was added and removed', () => {
    let state = reducer(initialState, countryAdded());
    state = reducer(state, countryRemoved(1));
    expect(reducer(state, startDatePrefilled(TODAY)).details.startDate).toBe(TODAY);
  });

  it('adds, changes and removes country rows', () => {
    let state = reducer(filled, countryAdded());
    expect(state.details.countryIds).toEqual([1, null]);
    state = reducer(state, countryChanged({ index: 1, countryId: 7 }));
    expect(state.details.countryIds).toEqual([1, 7]);
    state = reducer(state, countryRemoved(0));
    expect(state.details.countryIds).toEqual([7]);
  });

  it('adds no more than MAX_COUNTRIES rows', () => {
    const full = { ...filled, details: { ...filled.details, countryIds: [1, 2, 3, 4, 5] } };
    expect(reducer(full, countryAdded()).details.countryIds).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps at least one country row', () => {
    expect(reducer(filled, countryRemoved(0)).details.countryIds).toEqual([1]);
  });

  it('forgets the chosen program when the chosen countries change', () => {
    const withProgram = { ...filled, programId: 3 };
    expect(reducer(withProgram, countryChanged({ index: 0, countryId: 1 })).programId).toBe(3);
    expect(reducer(withProgram, countryChanged({ index: 0, countryId: 2 })).programId).toBeNull();

    const withEmptyRow = reducer(withProgram, countryAdded());
    expect(withEmptyRow.programId).toBe(3);
    expect(reducer(withEmptyRow, countryRemoved(1)).programId).toBe(3);

    const withTwo = reducer(withEmptyRow, countryChanged({ index: 1, countryId: 2 }));
    expect(withTwo.programId).toBeNull();
    expect(reducer({ ...withTwo, programId: 3 }, countryRemoved(0)).programId).toBeNull();
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

  it('hides errors from a previous visit on hydrate', () => {
    const state = reducer(initialState, hydrate({ ...filled, submitAttempted: true }));
    expect(state).toEqual({ ...filled, submitAttempted: false });
  });
});
