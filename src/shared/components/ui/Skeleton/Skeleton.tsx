import { cn } from '@/shared/utils/cn';
import styles from './Skeleton.module.scss';

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn(styles.skeleton, className)} aria-hidden />;
}
