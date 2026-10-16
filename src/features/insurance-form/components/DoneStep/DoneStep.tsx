'use client';

import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';
import { useDispatch } from 'react-redux';
import { useFormSelector } from '../../model/hooks';
import { reset, selectOrderId } from '../../model/slice';
import styles from './DoneStep.module.scss';

export function DoneStep() {
  const dispatch = useDispatch();
  const orderId = useFormSelector(selectOrderId);

  return (
    <div className={styles.step} role="status">
      <Image src="/icons/radio-checked.svg" alt="" width={48} height={48} unoptimized />
      <h1 className={styles.title}>Полис оформлен</h1>
      <p className={styles.text}>
        Номер заявки: <strong>{orderId?.slice(0, 8).toUpperCase()}</strong>. Мы отправим полис на
        указанный номер телефона.
      </p>
      <Button onClick={() => dispatch(reset())}>Оформить заново</Button>
    </div>
  );
}
