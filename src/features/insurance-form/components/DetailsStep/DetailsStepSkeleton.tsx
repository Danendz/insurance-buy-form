import type { ReactNode } from 'react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { cn } from '@/shared/utils/cn';
import layout from './DetailsStep.module.scss';
import styles from './DetailsStepSkeleton.module.scss';

const ACTIVITY_WIDTHS = [36, 35, 29, 30];

function RadioSkeleton({ width }: { width: number }) {
  return (
    <span className={styles.radio}>
      <Skeleton className={styles.mark} />
      <Skeleton className={styles.radioText} width={width} />
    </span>
  );
}

export function ActivitiesSkeleton() {
  return (
    <div className={layout.activities} aria-busy>
      {ACTIVITY_WIDTHS.map((width, index) => (
        <RadioSkeleton key={index} width={width} />
      ))}
    </div>
  );
}

function FieldSkeleton({
  labelWidth,
  indented = false,
  children,
}: {
  labelWidth?: number;
  indented?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn(styles.field, indented && layout.indented)}>
      <div className={styles.header}>
        {labelWidth && <Skeleton className={styles.label} width={labelWidth} />}
        <Skeleton className={styles.hint} />
      </div>
      {children}
    </div>
  );
}

function DateSkeleton() {
  return (
    <div className={styles.row}>
      <Skeleton className={styles.dateSelect} width={56} />
      <Skeleton className={styles.dateSelect} width={107} />
      <Skeleton className={styles.dateSelect} width={72} />
      <Skeleton className={styles.calendar} />
    </div>
  );
}

/** Mirrors `DetailsStep` while it can't render yet. */
export function DetailsStepSkeleton() {
  return (
    <div className={layout.form}>
      <h1 className={layout.title}>Покупка страхового полиса</h1>
      <FieldSkeleton labelWidth={124}>
        <div className={layout.countryRow}>
          <Skeleton className={styles.select} />
          <Skeleton className={styles.addCountry} />
        </div>
      </FieldSkeleton>
      <FieldSkeleton labelWidth={82}>
        <div className={layout.coverageTypes}>
          <RadioSkeleton width={110} />
          <RadioSkeleton width={116} />
        </div>
      </FieldSkeleton>
      <FieldSkeleton labelWidth={122} indented>
        <DateSkeleton />
      </FieldSkeleton>
      <FieldSkeleton labelWidth={115} indented>
        <DateSkeleton />
      </FieldSkeleton>
      <FieldSkeleton>
        <ActivitiesSkeleton />
      </FieldSkeleton>
      <FieldSkeleton labelWidth={174} indented>
        <div className={cn(styles.row, styles.phone)}>
          <Skeleton className={styles.phoneCountry} />
          <Skeleton className={styles.phoneInput} />
        </div>
      </FieldSkeleton>
      <div className={layout.footer}>
        <Skeleton className={styles.button} />
        <div className={styles.note}>
          <Skeleton className={styles.noteLine} width={240} />
          <Skeleton className={styles.noteLine} width={150} />
        </div>
      </div>
    </div>
  );
}
