import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Button.module.scss';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(styles.button, styles[variant], className)} {...props} />
  );
}
