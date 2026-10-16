import { createSessionPersistence } from '@/shared/lib/store/sessionPersistence';
import { insuranceFormSlice } from '../slice';

export const insuranceFormPersistence = createSessionPersistence({
  key: 'insurance-buy-form:v4',
  slice: insuranceFormSlice,
});
