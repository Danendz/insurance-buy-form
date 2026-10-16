'use client';

import { Button } from '@/components/Button';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { nextStep, prevStep, selectCurrentStep, STEP_COUNT } from '../../model/slice';
import styles from './InsuranceForm.module.scss';

export function InsuranceForm() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectCurrentStep);
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEP_COUNT - 1;

  return (
    <section className={styles.form} aria-label="Insurance purchase form">
      <p className={styles.progress}>
        Step {currentStep + 1} of {STEP_COUNT}
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => dispatch(prevStep())} disabled={isFirst}>
          Back
        </Button>
        <Button onClick={() => dispatch(nextStep())} disabled={isLast}>
          Next
        </Button>
      </div>
    </section>
  );
}
