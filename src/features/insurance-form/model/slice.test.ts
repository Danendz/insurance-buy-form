import { describe, expect, it } from 'vitest';
import { hydrate, insuranceFormSlice, nextStep, prevStep, STEP_COUNT } from './slice';

const reducer = insuranceFormSlice.reducer;

describe('insuranceForm slice', () => {
  it('starts on the first step', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({ currentStep: 0 });
  });

  it('moves between steps within bounds', () => {
    expect(reducer({ currentStep: 0 }, nextStep())).toEqual({ currentStep: 1 });
    expect(reducer({ currentStep: STEP_COUNT - 1 }, nextStep())).toEqual({
      currentStep: STEP_COUNT - 1,
    });
    expect(reducer({ currentStep: 1 }, prevStep())).toEqual({ currentStep: 0 });
    expect(reducer({ currentStep: 0 }, prevStep())).toEqual({ currentStep: 0 });
  });

  it('replaces state on hydrate', () => {
    expect(reducer({ currentStep: 0 }, hydrate({ currentStep: 2 }))).toEqual({ currentStep: 2 });
  });
});
