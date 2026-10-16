import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Select.module.scss';

export type SelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  size?: 'md' | 'sm';
  placeholder?: string;
  invalid?: boolean;
};

export function Select({
  size = 'md',
  placeholder,
  invalid = false,
  value,
  className,
  children,
  ...props
}: SelectProps) {
  const isEmpty = value === '' || value === undefined;
  return (
    <select
      value={value}
      aria-invalid={invalid || undefined}
      className={cn(styles.select, styles[size], isEmpty && styles.empty, className)}
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
