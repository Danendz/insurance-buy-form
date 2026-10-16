import { createLocalStoragePersistence } from '@/shared/lib/store/localStoragePersistence';
import { insuranceFormSlice } from '../slice';

export const insuranceFormPersistence = createLocalStoragePersistence({
  key: 'insurance-buy-form:v2',
  slice: insuranceFormSlice,
  maxAgeDays: 30,
});
