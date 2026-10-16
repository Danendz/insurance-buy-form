import { useSyncExternalStore } from 'react';
import type { IsoDate } from '@/shared/types/date';
import { todayIsoDate } from '@/shared/utils/date';

const subscribe = () => () => {};

/**
 * `null` on the server and during hydration: the server's "today" can differ from the user's
 * (time zone), so date-dependent UI must render on the client.
 */
export function useClientToday(): IsoDate | null {
  return useSyncExternalStore(subscribe, todayIsoDate, () => null);
}
