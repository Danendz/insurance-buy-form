'use client';

import { Card } from '@/shared/components/ui/Card';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useClientToday } from '@/shared/hooks/useClientToday';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { goToDetails, selectStep, STEPS } from '../../model/slice';
import { DetailsStep } from '../../components/DetailsStep';
import { DoneStep } from '../../components/DoneStep';
import { ProgramStep } from '../../components/ProgramStep';
import { SummaryPanel } from '../../components/SummaryPanel';
import styles from './InsuranceFormPage.module.scss';

export function InsuranceFormPage() {
  const dispatch = useAppDispatch();
  const step = useAppSelector(selectStep);
  const today = useClientToday();

  if (!today) {
    return (
      <main className={styles.page}>
        <div className={styles.layout}>
          <Card className={styles.card} aria-busy>
            <Skeleton className={styles.loading} />
          </Card>
        </div>
      </main>
    );
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <main className={styles.page}>
      <div className={styles.layout} data-step={step}>
        <Card className={styles.card} data-step={step} aria-label="Покупка страхового полиса">
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
