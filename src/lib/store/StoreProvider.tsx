'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { hydrateInsuranceForm } from '@/features/insurance-form';
import { loadPersistedState } from './persistence';
import { makeStore } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  // Restore after mount so the server and first client render produce the same markup.
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      store.dispatch(hydrateInsuranceForm(persisted.insuranceForm));
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
