import {
  createListenerMiddleware,
  type Dispatch,
  type PayloadActionCreator,
  type Slice,
} from '@reduxjs/toolkit';

type PersistedSlice<State> = Slice<State> & {
  actions: { hydrate: PayloadActionCreator<State> };
};

type Options<State> = {
  /** Version it (`name:v2`) whenever the state shape changes, so stale data is ignored. */
  key: string;
  slice: PersistedSlice<State>;
};

export type SessionPersistence = {
  middleware: ReturnType<typeof createListenerMiddleware>['middleware'];
  /** Call after mount, so the server and the first client render match. */
  restore: (dispatch: Dispatch) => void;
};

/** Saves one slice to sessionStorage on every change and restores it with `slice.actions.hydrate`. */
export function createSessionPersistence<State>({
  key,
  slice,
}: Options<State>): SessionPersistence {
  const select = (state: unknown) => (state as Record<string, State>)[slice.reducerPath];
  const listener = createListenerMiddleware();

  listener.startListening({
    predicate: (_action, current, previous) => select(current) !== select(previous),
    effect: (_action, api) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(select(api.getState())));
      } catch {
        // Storage can be full or disabled; persistence is best-effort.
      }
    },
  });

  return {
    middleware: listener.middleware,
    restore(dispatch) {
      let saved: State | undefined;
      try {
        const raw = sessionStorage.getItem(key);
        saved = raw ? (JSON.parse(raw) as State) : undefined;
      } catch {
        saved = undefined;
      }
      if (saved) dispatch(slice.actions.hydrate(saved));
    },
  };
}
