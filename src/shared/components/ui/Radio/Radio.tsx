import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Radio.module.scss';

export type RadioProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: ReactNode;
};

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className={cn(styles.radio, className)}>
      <input type="radio" className={styles.input} {...props} />
      <span className={styles.mark} aria-hidden />
      <span>{label}</span>
    </label>
  );
}
