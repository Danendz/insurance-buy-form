import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InsuranceFormState, IsoDate, Step, TripDetails } from '../types';
import { hasErrors, validateDetails } from './validation';

export const STEPS: Step[] = ['details', 'program'];

export const initialState: InsuranceFormState = {
  step: 'details',
  details: {
    countryId: null,
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

export const insuranceFormSlice = createSlice({
  name: 'insuranceForm',
  initialState,
  reducers: {
    updateDetails(state, action: PayloadAction<Partial<TripDetails>>) {
      const { countryId } = action.payload;
      // Programs differ per country.
      if (countryId !== undefined && countryId !== state.details.countryId) {
        state.programId = null;
      }
      Object.assign(state.details, action.payload);
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
    hydrate(_state, action: PayloadAction<InsuranceFormState>) {
      return action.payload;
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
