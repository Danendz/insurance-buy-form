'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import styles from './Tooltip.module.scss';

const isMouse = (event: PointerEvent) => event.pointerType === 'mouse';

export function Tooltip({ text }: { text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  // A tap fires focus (opens) before click (toggles); click must toggle the state from before the tap.
  const openAtPress = useRef<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    // Touch devices don't blur the button when tapping elsewhere.
    const closeOutside = (event: globalThis.PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={styles.wrapper}
      onPointerLeave={(event) => isMouse(event) && setOpen(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label="Подсказка"
        aria-describedby={id}
        aria-expanded={open}
        onPointerDown={() => (openAtPress.current = open)}
        onClick={() => {
          const wasOpen = openAtPress.current ?? open;
          openAtPress.current = null;
          setOpen(!wasOpen);
        }}
        onPointerEnter={(event) => isMouse(event) && setOpen(true)}
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
