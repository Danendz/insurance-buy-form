// Client-safe public API; server-only exports go to `./server.ts`.
export { InsuranceForm } from './components/InsuranceForm/InsuranceForm';
export { insuranceFormPersistence } from './model/persistence';
export {
  insuranceFormSlice,
  initialState as initialFormState,
  updateDetails,
  submitDetails,
  goToDetails,
  selectProgram,
  orderPlaced,
  reset,
  selectStep,
  STEPS,
} from './model/slice';
export type { InsuranceFormState } from './types';
