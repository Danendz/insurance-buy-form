import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore, type RootState } from '@/lib/store/store';

type RenderWithStoreOptions = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
};

/** Renders `ui` inside a fresh Redux store and returns the store plus a userEvent instance. */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState), ...options }: RenderWithStoreOptions = {},
) {
  return {
    store,
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      ...options,
    }),
  };
}
