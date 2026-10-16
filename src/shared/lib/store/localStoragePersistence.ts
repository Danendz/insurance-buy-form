import {
  createListenerMiddleware,
  type Dispatch,
  type PayloadActionCreator,
  type Slice,
} from '@reduxjs/toolkit';

const DAY_MS = 24 * 60 * 60 * 1000;

type Saved<State> = { savedAt: number; state: State };

type PersistedSlice<State> = Slice<State> & {
  actions: { hydrate: PayloadActionCreator<State> };
};

type Options<State> = {
  /** Version it (`name:v2`) whenever the state shape changes, so stale data is ignored. */
  key: string;
  slice: PersistedSlice<State>;
  /** Saved data older than this is dropped on restore. */
  maxAgeDays: number;
};

export type LocalStoragePersistence = {
  middleware: ReturnType<typeof createListenerMiddleware>['middleware'];
  /** Call after mount, so the server and the first client render match. */
  restore: (dispatch: Dispatch) => void;
};

/** Saves one slice to localStorage on every change and restores it with `slice.actions.hydrate`. */
export function createLocalStoragePersistence<State>({
  key,
  slice,
  maxAgeDays,
}: Options<State>): LocalStoragePersistence {
  const select = (state: unknown) => (state as Record<string, State>)[slice.reducerPath];
  const listener = createListenerMiddleware();

  listener.startListening({
    predicate: (_action, current, previous) => select(current) !== select(previous),
    effect: (_action, api) => {
      try {
        const saved: Saved<State> = { savedAt: Date.now(), state: select(api.getState()) };
        localStorage.setItem(key, JSON.stringify(saved));
      } catch {
        // Storage can be full or disabled; persistence is best-effort.
      }
    },
  });

  return {
    middleware: listener.middleware,
    restore(dispatch) {
      let saved: Saved<State> | undefined;
      try {
        const raw = localStorage.getItem(key);
        saved = raw ? (JSON.parse(raw) as Saved<State>) : undefined;
      } catch {
        saved = undefined;
      }
      if (!saved) return;
      const fresh =
        typeof saved.savedAt === 'number' && Date.now() - saved.savedAt <= maxAgeDays * DAY_MS;
      if (!fresh) {
        localStorage.removeItem(key);
        return;
      }
      dispatch(slice.actions.hydrate(saved.state));
    },
  };
}
