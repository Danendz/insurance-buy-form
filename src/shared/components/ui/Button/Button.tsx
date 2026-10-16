import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Button.module.scss';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'link';
  /** Full width with content spread to the edges, e.g. a label and a price. */
  wide?: boolean;
};

export function Button({
  variant = 'primary',
  wide = false,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], wide && styles.wide, className)}
      {...props}
    />
  );
}
