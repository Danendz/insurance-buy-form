import { useId } from 'react';
import type { Program } from '../../types';
import { formatLiability } from '../../model/format';
import styles from './ProgramCard.module.scss';

type ProgramCardProps = {
  program: Program;
  checked: boolean;
  onSelect: () => void;
};

export function ProgramCard({ program, checked, onSelect }: ProgramCardProps) {
  const id = useId();
  return (
    <label className={styles.card} data-checked={checked}>
      <input
        type="radio"
        name="programId"
        value={program.id}
        checked={checked}
        onChange={onSelect}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-liability ${id}-description`}
        className={styles.input}
      />
      <span className={styles.mark} aria-hidden />
      <span id={`${id}-title`} className={styles.title}>
        {program.title}
      </span>
      <span id={`${id}-liability`} className={styles.liability}>
        Общее покрытие - {formatLiability(program.liability)}
      </span>
      <span id={`${id}-description`} className={styles.description}>
        {program.description}
      </span>
    </label>
  );
}
