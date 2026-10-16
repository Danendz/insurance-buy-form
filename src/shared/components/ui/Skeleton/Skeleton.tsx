import { cn } from '@/shared/utils/cn';
import styles from './Skeleton.module.scss';

type SkeletonProps = {
  className?: string;
  /** px at the default 16px root font size; scales like `rem()`. */
  width?: number;
};

export function Skeleton({ className, width }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={width === undefined ? undefined : { width: `${width / 16}rem` }}
      aria-hidden
    />
  );
}
