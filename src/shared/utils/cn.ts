/** Joins truthy class names: `cn(styles.a, isActive && styles.b)`. */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}
