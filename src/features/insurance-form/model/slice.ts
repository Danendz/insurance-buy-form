import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InsuranceFormState } from '../types';

// Placeholder until the real steps are defined.
export const STEP_COUNT = 3;

const initialState: InsuranceFormState = {
  currentStep: 0,
};

export const insuranceFormSlice = createSlice({
  name: 'insuranceForm',
  initialState,
  reducers: {
    nextStep(state) {
      state.currentStep = Math.min(state.currentStep + 1, STEP_COUNT - 1);
    },
    prevStep(state) {
      state.currentStep = Math.max(state.currentStep - 1, 0);
    },
    /** Restores state saved in sessionStorage. */
    hydrate(_state, action: PayloadAction<InsuranceFormState>) {
      return action.payload;
    },
  },
  selectors: {
    selectCurrentStep: (state) => state.currentStep,
  },
});

export const { nextStep, prevStep, hydrate } = insuranceFormSlice.actions;
export const { selectCurrentStep } = insuranceFormSlice.selectors;
