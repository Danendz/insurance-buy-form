import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InsuranceFormState, IsoDate, Step, TripDetails } from '../../types';
import { hasErrors, MAX_COUNTRIES, validateDetails } from '../validation';

const shallowEqual = <T extends object>(a: T, b: T) =>
  (Object.keys(a) as (keyof T)[]).every((key) => a[key] === b[key]);

const chosenCountries = (countryIds: (number | null)[]) =>
  [...new Set(countryIds.filter((id) => id !== null))].sort((a, b) => a - b).join();

export const STEPS: Step[] = ['details', 'program'];

export const initialState: InsuranceFormState = {
  step: 'details',
  details: {
    countryIds: [null],
    coverageType: 'single',
    startDate: null,
    endDate: null,
    activityId: null,
    phone: '',
  },
  phoneValid: null,
  programId: null,
  orderId: null,
  submitAttempted: false,
};

// Programs depend on the chosen countries.
function setCountryIds(state: InsuranceFormState, countryIds: (number | null)[]) {
  if (chosenCountries(countryIds) !== chosenCountries(state.details.countryIds)) {
    state.programId = null;
  }
  state.details.countryIds = countryIds;
}

export const insuranceFormSlice = createSlice({
  name: 'insuranceForm',
  initialState,
  reducers: {
    updateDetails(state, action: PayloadAction<Partial<Omit<TripDetails, 'countryIds'>>>) {
      Object.assign(state.details, action.payload);
    },
    countryAdded(state) {
      if (state.details.countryIds.length < MAX_COUNTRIES) {
        state.details.countryIds.push(null);
      }
    },
    countryChanged(state, action: PayloadAction<{ index: number; countryId: number }>) {
      const { index, countryId } = action.payload;
      setCountryIds(state, state.details.countryIds.with(index, countryId));
    },
    countryRemoved(state, action: PayloadAction<number>) {
      const { countryIds } = state.details;
      if (countryIds.length > 1) {
        setCountryIds(state, countryIds.toSpliced(action.payload, 1));
      }
    },
    startDatePrefilled(state, action: PayloadAction<IsoDate>) {
      const { details } = state;
      const pristine =
        state.step === 'details' &&
        !state.submitAttempted &&
        details.countryIds.every((id) => id === null) &&
        shallowEqual(
          { ...details, countryIds: initialState.details.countryIds },
          initialState.details,
        );
      if (pristine) {
        state.details.startDate = action.payload;
      }
    },
    phoneValidityChanged(state, action: PayloadAction<boolean>) {
      state.phoneValid = action.payload;
    },
    submitDetails(state, action: PayloadAction<IsoDate>) {
      state.submitAttempted = true;
      const errors = validateDetails(state.details, action.payload, {
        phoneValid: state.phoneValid,
      });
      if (!hasErrors(errors)) {
        state.step = 'program';
      }
    },
    goToDetails(state) {
      state.step = 'details';
    },
    selectProgram(state, action: PayloadAction<number>) {
      state.programId = action.payload;
    },
    orderPlaced(state, action: PayloadAction<string>) {
      state.orderId = action.payload;
      state.step = 'done';
    },
    reset() {
      return initialState;
    },
    // Errors show only after «Далее» in the current visit.
    hydrate(_state, action: PayloadAction<InsuranceFormState>) {
      return { ...action.payload, submitAttempted: false };
    },
  },
  selectors: {
    selectStep: (state) => state.step,
    selectDetails: (state) => state.details,
    selectProgramId: (state) => state.programId,
    selectOrderId: (state) => state.orderId,
    selectSubmitAttempted: (state) => state.submitAttempted,
    selectDetailsErrors: createSelector(
      [
        (state: InsuranceFormState) => state.details,
        (state: InsuranceFormState) => state.phoneValid,
        (_state, today: IsoDate) => today,
      ],
      (details, phoneValid, today) => validateDetails(details, today, { phoneValid }),
    ),
  },
});

export const {
  updateDetails,
  countryAdded,
  countryChanged,
  countryRemoved,
  startDatePrefilled,
  phoneValidityChanged,
  submitDetails,
  goToDetails,
  selectProgram,
  orderPlaced,
  reset,
  hydrate,
} = insuranceFormSlice.actions;

export const {
  selectStep,
  selectDetails,
  selectProgramId,
  selectOrderId,
  selectSubmitAttempted,
  selectDetailsErrors,
} = insuranceFormSlice.selectors;
