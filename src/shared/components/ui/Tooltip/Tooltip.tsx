'use client';

import { useId, useState } from 'react';
import styles from './Tooltip.module.scss';

export function Tooltip({ text }: { text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={styles.wrapper} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Подсказка"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      >
        ?
      </button>
      <span id={id} role="tooltip" className={styles.bubble} data-open={open}>
        {text}
      </span>
    </span>
  );
}
