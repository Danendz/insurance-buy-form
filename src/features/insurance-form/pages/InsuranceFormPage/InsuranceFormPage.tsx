'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';
import { useClientToday } from '@/shared/hooks/useClientToday';
import { useDispatch } from 'react-redux';
import { useFormSelector } from '../../model/hooks';
import { goToDetails, selectStep, STEPS } from '../../model/slice';
import { DetailsStep, DetailsStepSkeleton } from '../../components/DetailsStep';
import { DoneStep } from '../../components/DoneStep';
import { ProgramStep } from '../../components/ProgramStep';
import { SummaryPanel } from '../../components/SummaryPanel';
import styles from './InsuranceFormPage.module.scss';

export function InsuranceFormPage() {
  const dispatch = useDispatch();
  const step = useFormSelector(selectStep);
  const today = useClientToday();
  const cardRef = useRef<HTMLDivElement>(null);
  // Restoring saved state also changes the step; only a step the user moved to takes focus.
  const userActed = useRef(false);

  useEffect(() => {
    const markUserActed = () => {
      userActed.current = true;
    };
    document.addEventListener('pointerdown', markUserActed, { once: true });
    document.addEventListener('keydown', markUserActed, { once: true });
    return () => {
      document.removeEventListener('pointerdown', markUserActed);
      document.removeEventListener('keydown', markUserActed);
    };
  }, []);

  // The control that switched the step unmounts, so focus would fall back to <body>.
  useEffect(() => {
    if (userActed.current) cardRef.current?.querySelector('h1')?.focus();
  }, [step]);

  if (!today) {
    return (
      <main className={styles.page}>
        <div className={styles.layout}>
          <Card className={styles.card} aria-busy>
            <header className={styles.header}>
              <ProgressBar total={STEPS.length} current={0} label="Шаг оформления" />
            </header>
            <DetailsStepSkeleton />
          </Card>
        </div>
      </main>
    );
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <main className={styles.page}>
      <div className={styles.layout} data-step={step}>
        <Card ref={cardRef} className={styles.card} data-step={step}>
          {step !== 'done' && (
            <header className={styles.header}>
              <ProgressBar total={STEPS.length} current={stepIndex} label="Шаг оформления" />
              {stepIndex > 0 && (
                <IconButton
                  icon="/icons/back.svg"
                  size={30}
                  label="Назад"
                  className={styles.back}
                  onClick={() => dispatch(goToDetails())}
                />
              )}
            </header>
          )}
          {step === 'details' && <DetailsStep today={today} />}
          {step === 'program' && <ProgramStep today={today} />}
          {step === 'done' && <DoneStep />}
        </Card>
        {step === 'program' && <SummaryPanel />}
      </div>
    </main>
  );
}
