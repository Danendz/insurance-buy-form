# Architecture

Rules for humans and AI agents working in this repo. Read before adding or moving code.

## Layers

```
shared  →  features  →  store  →  app
```

A layer may import only from layers to its left. ESLint (`eslint.config.mjs`) enforces it.

| Layer      | Path                  | Holds                                                     | May import                                                      |
| ---------- | --------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| `shared`   | `src/shared/`         | Code with no business knowledge of a specific feature     | `shared` only                                                   |
| `features` | `src/features/<name>` | One business module: its UI, state, domain logic, types   | `shared`, other features' public API                            |
| `store`    | `src/store/`          | App store composition: `makeStore`, `RootState`, provider | `shared`, features' public API                                  |
| `app`      | `src/app/`            | Next.js routing, layouts, metadata, `/api` route handlers | everything; `/api` only `shared` and `@/features/<name>/server` |

Tests are exempt from the layer rules (e.g. a feature test may use `@/store/test-utils`).

## Where does new code go?

Ask: _would another feature use this unchanged?_

- Yes → `shared`. Make it configurable through props or options instead of hard-coding feature values (`titleCaseUpper(text, { lowercase })`, `PhoneField validate`).
- No → the feature. A thin feature wrapper around a shared helper is fine (`features/insurance-form/model/format`).
- Wires features together (store, providers) → `store`.
- A URL, layout or HTTP endpoint → `app`. A route file only renders a feature page (`app/page.tsx` → `<InsuranceFormPage />`).

### `shared`

```
shared/
├── api/                # RTK Query: `baseApi`, shared endpoints (dictionaries), their types
├── components/
│   ├── ui/             # presentational kit: Button, Card, Select, Radio, Skeleton, LoadError, …
│   └── form-fields/    # Field (label/hint/error wrapper) and composite inputs: DateField, PhoneField
├── hooks/              # generic React hooks (`useClientToday`)
├── lib/                # setup helpers for external tools (`lib/store/sessionPersistence`)
├── styles/             # SCSS `_variables`, `_mixins`, `_functions` (load with `@use 'variables' as *;`)
│   └── globals/        # `_reset`, `_root`; `index.scss` is imported once by `app/layout.tsx`
├── types/              # generic types (`IsoDate`)
└── utils/              # pure functions (`date`, `format`, `cn`, `delay`)
```

Shared components take data through props and never read the store.

### Feature anatomy

```
features/<name>/
├── pages/<Page>/{Page.tsx, Page.module.scss, Page.test.tsx, index.ts}
├── components/<Component>/{Component.tsx, Component.module.scss, index.ts}
├── model/<module>/{module.ts, module.test.ts, index.ts}
│                       # slice, hooks, api (injected endpoints), validation, price, format, persistence
├── types/index.ts      # domain types
├── index.ts            # client-safe public API
└── server.ts           # server-only public API ('server-only'): pure logic for `/api`
```

- **Pages** are the screens a route renders. A page owns `<main>`, the screen layout and step switching, and composes `components/`.
- **Components** are the pieces a page composes; they don't know which route they are on.
- Other layers import a feature only through `@/features/<name>` or `@/features/<name>/server`. Inside a feature, use relative imports.
- Never re-export server code from `index.ts`; client bundles import it.
- Don't create empty folders for future use.

## State

- **One RTK Query API.** `shared/api/baseApi.ts` holds `createApi` with no endpoints. Shared endpoints (`shared/api/dictionary.ts`) and feature endpoints (`features/*/model/api`) are added with `baseApi.injectEndpoints`.
- **Slices** live in `features/*/model/slice` and are registered in `src/store/store.ts` through `combineSlices`.
- Only `store` knows the full `RootState`. A feature reads its slice with its own `useSelector.withTypes<WithSlice<typeof slice>>()` hook (`model/hooks`) and dispatches with `useDispatch`.
- **Persistence.** To keep a slice in sessionStorage, give it a `hydrate` reducer and create `createSessionPersistence({ key, slice })` in the feature (`model/persistence`). Add it to `persistences` in `src/store/store.ts`. Version the key (`name:v3`) and bump it whenever the state shape changes.
- The store is created per request (`makeStore`) and restored after mount, so server and first client render match.
- Anything that depends on "today" renders on the client through `useClientToday`.

## API (`src/app/api`)

- Mock backend. Data lives in `_data/data.json`; helpers in `_lib/`.
- Raw dictionaries go under `/api/dictionary/*`. Endpoints with business logic (filtering, pricing, validation, orders) sit at the top level.
- Business logic runs on the server. The client fetches and displays; it never filters or prices on its own.
- Raw data is normalized before it is served (country names are title-cased in `_lib/catalog.ts`), so the client renders it as is.
- Pure logic shared by the client and the server (validation, price formula) lives in the feature's `model/` and reaches `/api` through `server.ts`.
- Every handler calls `simulateNetwork()` (`connection()` + `API_DELAY_MS` delay).

## Styling

- SCSS modules next to the component. Use tokens from `_variables.scss` and mixins from `_mixins.scss` (`sm-up` … `xxl-up`, `focus-ring`, `visually-hidden`).
- Sizes go through `rem(px)` from `_functions.scss` (`font-size: rem(12px)`), so the form follows the user's font size and scales with the root steps in `shared/styles/globals/_root.scss`. 1px borders, shadows and breakpoints stay in px.
- Class names in camelCase; combine them with `cn`.

## Tests

- Next to the code as `*.test.ts(x)`. Pure logic is test-first.
- Components connected to Redux render with `renderWithStore` (`@/store/test-utils`).
- Component tests hit the real route handlers through `stubApi()` (`@/app/api/_lib/testing`), not hand-written mocks.

## Comments

Write a comment only when something critical is not obvious from the code: a constraint, a workaround, a non-obvious reason.

- State the constraint, not the history or the case that led to it.
- No mockup or Figma node references, no notes about one-off data quirks unless the code would look wrong without them.
- No JSDoc that restates the name or the signature; document units and formats (`EUR`, `E.164`, `YYYY-MM-DD`) where the type can't.
- Prefer a better name over a comment.
