import { InsuranceForm } from '@/features/insurance-form';
import styles from './page.module.scss';

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Buy insurance</h1>
      <InsuranceForm />
    </main>
  );
}
