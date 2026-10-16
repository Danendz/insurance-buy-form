import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
  total: number;
  /** Zero-based index of the active segment. */
  current: number;
  label: string;
};

export function ProgressBar({ total, current, label }: ProgressBarProps) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(current + 1, total)}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={styles.segment} data-active={index === current} />
      ))}
    </div>
  );
}
