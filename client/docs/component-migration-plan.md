# UI/Logic Decoupling Rollout

This guide captures the repeatable workflow for migrating the legacy React components in `client/src/components` to the new `features/<domain>/<feature>` + `components/ui` architecture. It doubles as the status tracker while we work through the directories.

## 1. Repeatable Workflow (per feature)

1. **Baseline survey**
   - Capture where the component is imported and list the hooks/stores/side-effects in use.
   - Note required props, route dependencies, analytics events, and derived values used in the JSX.
2. **Domain + folder mapping**
   - Assign a domain (`features/<domain>/<feature>`) and define the target UI files under `components/ui/<domain>/`.
   - Record any shared utilities that should live in `shared/<domain>` or `lib/`.
3. **Scaffold**
   - Add `use<Feature>ViewModel.ts`, `<Feature>Container.tsx`, and an `index.ts` barrel inside the `features` folder.
   - Create the presentational component(s) in `components/ui/<domain>/` with dumb props.
4. **Extract logic**
   - Move data-fetching, store access, memoised derivations, and imperative handlers (analytics, routing, wallet wiring) into the view model.
   - Keep the container to routing/context glue and state branching (loading/empty/error).
5. **Adapt UI**
   - Shape the view-model output to plain serialisable props for the presentational component; refactor JSX accordingly.
   - Delete or reduce the original component to re-export the new container.
6. **Tests & stories**
   - Add a `*.test.ts` beside the view model covering: loading/empty, main happy path, edge conditions (missing deps, optional filters).
   - Update or create Storybook/visual fixtures for the UI component using fixture props.
7. **Verification**
   - Run targeted lint/tests (`pnpm turbo run lint --filter client`, `pnpm turbo run test --filter client`).
   - Smoke-test the feature locally (or rely on existing E2E) and capture notes if manual QA is needed.
8. **Cleanup**
   - Remove dead helpers left in the old component, migrate duplicated logic into shared helpers, and update docs/import paths.
9. **Status update**
   - Tick the checklist below, linking any follow-up tasks (shared util extraction, analytics refactors, etc.).

## 2. Component Inventory & Migration Status

| Component Directory      | Proposed Domain        | Target Feature(s) / View(s)                              | Current Status | Follow-ups |
|-------------------------|------------------------|-----------------------------------------------------------|----------------|------------|
| `marketplace`           | `marketplace/collections` | `MarketplaceCollectionsContainer`, `CollectionsGrid`      | ✅ completed   | Tests in place |
| `items`                 | `marketplace/items`     | `ItemsContainer`, `ItemsView`                             | ✅ completed   | View-model + UI split, price utils pending extraction |
| `filters`               | `marketplace/filters`   | `MarketplaceFiltersContainer`, `MarketplaceFiltersView`   | ✅ completed   | Monitor shared metadata utilities with items/holders |
| `holders`               | `marketplace/holders`   | `MarketplaceHoldersContainer`, `HoldersView`              | ✅ completed   | Shares metadata filters; consider navigation hooks later |
| `inventory`             | `player/inventory`      | `InventoryContainer`, `InventoryTokensView/InventoryCollectionsView` | ✅ completed   | Additional UX (navigation) hooks optional |
| `leaderboard`           | `leaderboard/main`      | `LeaderboardContainer`, `LeaderboardView`                 | ✅ completed   | Consider enhanced virtualization later |
| `achievements`          | `progress/achievements` | `AchievementsContainer`, `AchievementsView`               | ✅ completed   | Monitor pin/unpin UX for additional feedback |
| `activity`              | `progress/activity`     | `ActivityContainer`, `ActivityView`                       | ✅ completed   | Consider websocket streaming later |
| `about`                 | `marketing/about`       | `AboutContainer`, `AboutView`                             | ✅ completed   | Metrics chart still relies on existing hook |
| `connection`            | `account/connection`    | `ConnectionContainer`, `ConnectionView`                   | ✅ completed   | Observe analytics events for failures |
| `editions`              | `games/editions`        | `EditionsContainer`, `EditionsList`                       | ☐ pending      | Shares collection hooks |
| `errors`                | `core/errors`           | `ConnectContainer`, `ConnectView`                         | ✅ completed   | Replace static copy if brand updates |
| `games`                 | `games/catalog`         | `GamesContainer`, `GamesView`                             | ✅ completed   | Consider reintroducing search filtering if needed |
| `guilds`                | `social/guilds`         | `GuildsContainer`, `GuildsView`                           | ✅ completed   | Expand once guilds feature ships |
| `holders`               | `marketplace/holders`   | (see above)                                               | ☐ pending      | |
| `modules`               | `core/modules`          | `ModulesContainer`, `ModulesView`                         | ☐ pending      | Evaluate if shared util |
| `pages`                 | `core/pages`            | `PagesContainer`, `PagesView`                             | ☐ pending      | Might be routing wrappers |
| `positions`             | `predict/positions`     | `PositionsContainer`, `PositionsView`                     | ✅ completed   | Replace static data when API ready |
| `predict`               | `predict/main`          | `PredictContainer`, `PredictView`                         | ✅ completed   | Replace mock cards when predictive data exists |
| `scenes`                | `shell/scenes`          | `SceneContainer`, `SceneView`                             | ☐ pending      | Each scene may map to different domain |
| `traceability`          | `analytics/traceability`| `TraceabilityContainer`, `TraceabilityView`               | ☐ pending      | Heavy data viz; plan incremental |
| `user`                  | `account/profile`       | `UserProfileContainer`, `UserProfileView`                 | ☐ pending      | Connects to player store |
| `sidebar-toggle.tsx`    | `shell/sidebar`         | Convert to `SidebarToggle` UI-only component              | ☐ pending      | Likely small tweak |
| `header.tsx`            | `shell/header`          | `HeaderContainer`, `HeaderView`                           | ✅ completed   | Further enhancements: global nav analytics |
| `template.tsx`          | `shell/template`        | Layout container/view split                               | ☐ pending      | Check for router deps |
| `app.tsx`               | `shell/app`             | Root container (may remain orchestrator)                  | ☐ evaluate     | Possibly out of scope |

> Tip: update this table as each feature completes (✅/☑/☐) and attach PR/commit references for traceability.

> **2025-10-07:** Removed the legacy `client/src/components/{about,...,predict}` barrels, migrated their consumers to `features/*` containers, relocated the shared UI helpers into `components/ui/{editions,games,predict,positions}`, and scaffolded `features/traceability` with a placeholder view.

## 3. Shared Utilities Roadmap

- ✅ **Marketplace shared helpers**: price formatting, blockie fallbacks, and path builders now live under `shared/marketplace/{utils,path}.ts`; continue reusing them as remaining marketplace features migrate.
- **Analytics/event tracking**: standardise `useAnalytics` wrappers per domain (e.g., `features/<domain>/analytics.ts`).
- **Store adapters**: create thin selectors in `features/common/storeAdapters.ts` to keep UI unaware of zustand shapes.
- **Routing helpers**: consolidate route manipulation (regex replacements) into `shared/routing/pathUtils.ts` for reuse.

## 4. Testing Expectations

- Every view model must ship with a co-located `*.test.ts` covering:
  - loading/empty states
  - primary success path (with realistic mock data)
  - edge cases (missing optional deps, alternate filters, fallback imagery)
- Presentational components rely on Storybook/visual snapshots; include fixture prop generators in `tests/setup` where needed.
- For complex domains (predict/traceability), consider lightweight integration tests under `client/tests/integration` to validate container + view interplay.

## 5. Communication & Governance

- Add this document to the onboarding checklist and PR template.
- During code review, ensure no new logic lands directly in `components/ui/**`.
- Keep a running migration log (Jira/Notion) referencing rows from this table for team visibility.

---

**Owner:** Frontend Guild  
**Initiated:** YYYY-MM-DD (replace once schedule is set)
