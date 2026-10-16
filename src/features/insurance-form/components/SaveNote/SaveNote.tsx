import styles from './SaveNote.module.scss';

export function SaveNote() {
  return (
    <p className={styles.note}>
      <span className={styles.icon} aria-hidden>
        !
      </span>
      Не волнуйтесь! Вы можете покинуть сайт и продолжить с этого момента в любое время
    </p>
  );
}
