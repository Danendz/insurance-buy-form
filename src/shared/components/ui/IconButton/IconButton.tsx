import Image from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './IconButton.module.scss';

export type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  icon: string;
  size: number;
  /** Accessible name; the icon itself is decorative. */
  label: string;
};

export function IconButton({
  icon,
  size,
  label,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(styles.button, className)}
      {...props}
    >
      <Image
        src={icon}
        alt=""
        width={size}
        height={size}
        style={{ width: `${size / 16}rem`, height: 'auto' }}
        unoptimized
      />
    </button>
  );
}
