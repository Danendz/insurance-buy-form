import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
  total: number;
  /** Zero-based index of the active segment. */
  current: number;
  label: string;
};

export function ProgressBar({ total, current, label }: ProgressBarProps) {
  const now = Math.min(current + 1, total);
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={now}
      aria-valuetext={`${now} из ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={styles.segment} data-active={index === current} />
      ))}
    </div>
  );
}
