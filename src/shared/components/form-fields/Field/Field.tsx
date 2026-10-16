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
   * `group`: several inputs (radios, date parts), labelled with `<fieldset>` and `<legend>`.
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
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ');
  const control: FieldControlProps = {
    id,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': error ? true : undefined,
  };
  const isGroup = kind === 'group';
  const Root = isGroup ? 'fieldset' : 'div';

  return (
    <Root className={cn(styles.field, className)}>
      {isGroup && <legend className={styles.hidden}>{label}</legend>}
      <div className={styles.header}>
        {!isGroup ? (
          <label htmlFor={id} className={cn(styles.label, hideLabel && styles.hidden)}>
            {label}
          </label>
        ) : (
          // The legend names the group; this copy only keeps the «?» on the label's row.
          !hideLabel && (
            <span className={styles.label} aria-hidden>
              {label}
            </span>
          )
        )}
        {hint && <Tooltip id={hintId} text={hint} label={`Подсказка: ${label}`} />}
      </div>
      {children(control)}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </Root>
  );
}
