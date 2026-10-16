import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Select.module.scss';

export type SelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  size?: 'md' | 'sm';
  placeholder?: string;
  invalid?: boolean;
  /** Shows a spinner instead of the chevron and disables the select. */
  loading?: boolean;
};

export function Select({
  size = 'md',
  placeholder,
  invalid = false,
  loading = false,
  disabled,
  value,
  className,
  children,
  ...props
}: SelectProps) {
  const isEmpty = value === '' || value === undefined;
  return (
    <select
      value={value}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        styles.select,
        styles[size],
        isEmpty && styles.empty,
        loading && styles.loading,
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}
