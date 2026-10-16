'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Tooltip } from '@/shared/components/ui/Tooltip';
import styles from './Field.module.scss';

/** Ids and state to spread onto the control(s) inside a field. */
export type FieldControlProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
  /**
   * `control`: one input, labelled with `<label for>`.
   * `group`: several inputs (radios, date parts), labelled through `role="group"`.
   */
  kind?: 'control' | 'group';
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({
  label,
  hint,
  error,
  hideLabel = false,
  kind = 'control',
  className,
  children,
}: FieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const control: FieldControlProps = {
    id,
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': error ? true : undefined,
  };
  const Label = kind === 'control' ? 'label' : 'span';

  return (
    <div
      className={cn(styles.field, className)}
      role={kind === 'group' ? 'group' : undefined}
      aria-labelledby={kind === 'group' ? labelId : undefined}
      aria-describedby={kind === 'group' && error ? errorId : undefined}
    >
      <div className={styles.header}>
        <Label
          id={labelId}
          htmlFor={kind === 'control' ? id : undefined}
          className={cn(styles.label, hideLabel && styles.hidden)}
        >
          {label}
        </Label>
        {hint && <Tooltip text={hint} />}
      </div>
      {children(control)}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
