import { Button } from '@/shared/components/ui/Button';
import styles from './LoadError.module.scss';

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <span>{message}</span>
      <Button variant="link" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
