import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Card.module.scss';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn(styles.card, className)} {...props} />;
}
