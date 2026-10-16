'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, persistences } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    persistences.forEach((persistence) => persistence.restore(store.dispatch));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
