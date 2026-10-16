import type { Program } from '../../types';
import { formatLiability } from '../../model/format';
import styles from './ProgramCard.module.scss';

type ProgramCardProps = {
  program: Program;
  checked: boolean;
  onSelect: () => void;
};

export function ProgramCard({ program, checked, onSelect }: ProgramCardProps) {
  return (
    <label className={styles.card} data-checked={checked}>
      <input
        type="radio"
        name="programId"
        value={program.id}
        checked={checked}
        onChange={onSelect}
        className={styles.input}
      />
      <span className={styles.mark} aria-hidden />
      <span className={styles.title}>{program.title}</span>
      <span className={styles.liability}>
        Общее покрытие - {formatLiability(program.liability)}
      </span>
      <span className={styles.description}>{program.description}</span>
    </label>
  );
}
