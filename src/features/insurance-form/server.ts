// Server-only public API: pure domain logic shared with `/api`, without client components.
import 'server-only';

export { calculatePrice, tripDays } from './model/price';
export { hasErrors, validateDetails, validateTrip } from './model/validation';
export type * from './types';
