# Design Audit: Figma ↔ Storybook Component Mapping

**Date:** 2026-02-11  
**Scope:** Arcade Storybook components vs Figma design system (⚙️ Components page)  
**Storybook:** https://arcade-storybook.preview.cartridge.gg/  
**Repo:** `client/src/components/ui/`

---

## Executive Summary

- **Total Figma component sets identified:** ~85+
- **Storybook stories found:** 40 files
- **Coverage estimate:** ~40-50% of Figma components have corresponding stories
- **Key gaps:** Arcade V2 navigation, Explorer components, Activity feed events, Achievement cards, About section, Sidebar components, and several marketplace sub-components

---

## 1. Dashboard Cards

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Game Card (8 variants: Default/Large × Hover × Empty × Style=Alt) | `dashboard/GameCard.stories.tsx` | ✅ EXISTS | — |

### Notes
- Figma defines **Alt style** variants with hover, empty, and size (Default/Large) states
- Game Card in Figma shows: rounded card with full-bleed game art, bottom overlay with square icon, title (white bold), publisher (gray with controller icon)
- **Visual check needed:** Verify the Alt style variants are represented in stories, and that empty states match the Figma empty card designs

### Discrepancies
| Issue | Priority |
|---|---|
| Figma has explicit `Empty=True` variants — verify empty state is implemented | 🟡 Medium |
| Figma specifies `Size=Large` variant — check if story has large size option | 🟡 Medium |
| Figma `Style=Alt` naming — only Alt style shown; verify if there's a default style missing | 🟢 Low |

---

## 2. Marketplace Cards

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Marketplace Collection Card (10 variants: Empty × Hover × Mobile × Broken) | No direct match | ❌ MISSING | 🔴 High |
| Marketplace Asset Card (64+ variants: Empty × Hover × HasCheck × Selected × Listed × Multiple × Mobile × Broken) | `marketplace/collectible-card/index.stories.tsx` | ⚠️ PARTIAL | 🔴 High |

### Existing Collectible Card Stories
- `marketplace/collectible-card/index.stories.tsx` — Main card
- `marketplace/collectible-card/header.stories.tsx` — Card header
- `marketplace/collectible-card/footer.stories.tsx` — Card footer
- `marketplace/collectible-card/preview.stories.tsx` — Card preview

### Additional Marketplace Stories
- `marketplace/filters/AttributeSearch.stories.tsx`
- `marketplace/filters/OwnerFilterSection.stories.tsx`
- `marketplace/filters/PropertyItem.stories.tsx`
- `marketplace/token-detail/AssetPreview.stories.tsx`
- `marketplace/token-detail/TokenProperties.stories.tsx`
- `marketplace/token-detail/TokenTabs.stories.tsx`

### Discrepancies
| Issue | Priority |
|---|---|
| **Marketplace Collection Card** is entirely missing from Storybook — Figma shows a card with collection icon, title, nested NFT preview card, price/last sale row | 🔴 High |
| Figma Asset Card has `HasCheck`, `Selected`, `Listed`, `Multiple`, `Broken` states — verify all are covered in collectible-card stories | 🔴 High |
| Figma shows `Mobile=True` responsive variants — check if stories have mobile viewport testing | 🟡 Medium |
| Figma shows `Broken=True` image fallback state — verify broken image handling | 🟡 Medium |

---

## 3. Arcade Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Nav Bar Tabs (4 variants: Active × Hover × Theme) | `modules/tab.stories.tsx` | ✅ EXISTS | — |
| Nav Bar Tabs (v2, 4 variants) | `modules/tab.stories.tsx` | ⚠️ PARTIAL | 🟡 Medium |
| Sub Tab (4 variants: Active × Hover × Theme × Variant × Mobile) | `modules/sub-tab.stories.tsx` | ✅ EXISTS | — |
| Search Input (12 variants: Focus × HasValue × Hover × Variant) | `modules/search-input.stories.tsx` | ✅ EXISTS | — |
| Nav Bar (3 kinds: Game/Player/Collection) | No direct match | ⚠️ PARTIAL | 🟡 Medium |
| Tab Menu Item (4 variants) | `modules/menu-item.stories.tsx` | ✅ EXISTS | — |
| Tab Menu | No direct story | ⚠️ PARTIAL | 🟢 Low |
| Menu Button (6 variants: Active × Hover × Theme) | `modules/menu-button.stories.tsx` | ✅ EXISTS | — |
| Game Menu Button (6 variants: Tap × Kind × FilterActive) | No story | ❌ MISSING | 🟡 Medium |
| ERC 721 Header (2 variants) | No story | ❌ MISSING | 🟡 Medium |
| Tag Search Input (16+ variants) | No story | ❌ MISSING | 🟡 Medium |
| Improved Tag Search Input (7 variants) | No story | ❌ MISSING | 🟡 Medium |
| Global Search (6 variants) | No story | ❌ MISSING | 🟡 Medium |
| Activity Feed Tokens/Default | No story | ❌ MISSING | 🟡 Medium |
| ERC 721 Header (4 variants: Hover × ForSale) | No story | ❌ MISSING | 🟡 Medium |
| Collection Search Dropdown (2 variants) | No story | ❌ MISSING | 🟡 Medium |
| Global Search Dropdown | No story | ❌ MISSING | 🟡 Medium |
| Game Page Achievement Progress Tracking | No story | ❌ MISSING | 🟡 Medium |
| ERC 721 Marketplace Footer | No story | ❌ MISSING | 🟡 Medium |
| Collection Holder Column Labels | No story | ❌ MISSING | 🟢 Low |
| Collection Holders Row | No story | ❌ MISSING | 🟢 Low |
| Input Player Card (4 variants) | No story | ❌ MISSING | 🟡 Medium |
| Log in / Sign up player card (2 variants) | No story | ❌ MISSING | 🟡 Medium |
| Controller Dropdown Item (5 variants) | No story | ❌ MISSING | 🟡 Medium |
| Username Input - Default (6 variants) | No story | ❌ MISSING | 🟡 Medium |
| ERC 721 Marketplace Footer (12 variants: Type × Mobile × OwnAsset × Listed) | No story | ❌ MISSING | 🔴 High |
| Activity Tabs | No story | ❌ MISSING | 🟡 Medium |
| Global Search Result (16 variants: Kind × Hover × PartiallyCompleted) | No story | ❌ MISSING | 🔴 High |

### Discrepancies
| Issue | Priority |
|---|---|
| Many Arcade Component sub-components have no stories — large gap in coverage | 🔴 High |
| ERC 721 Marketplace Footer is complex (12 variants) with no story coverage | 🔴 High |
| Global Search and its dropdown/result components are entirely unstorified | 🔴 High |
| Tag Search Input components (original + improved) not in Storybook | 🟡 Medium |

---

## 4. Button Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Footer Primary Button (24 variants: Hover × Icon × Theme × Disabled × Multiple) | `button.stories.tsx` | ⚠️ PARTIAL | 🟡 Medium |
| Footer Secondary Button (30 variants: Text × Hover × Icon × TextColor × Multiple) | `button.stories.tsx` | ⚠️ PARTIAL | 🟡 Medium |
| Tertiary Button (3 variants: Active × Hover) | `button.stories.tsx` | ⚠️ PARTIAL | 🟡 Medium |
| Dropdown (2 variants each, 2 sets) | No story | ❌ MISSING | 🟡 Medium |
| Dropdown Menu Row (4 variants) | No story | ❌ MISSING | 🟡 Medium |
| Dropdown Menu | No story | ❌ MISSING | 🟡 Medium |
| Footer Primary Button - Wallet (8 variants: Metamask/Phantom × Hover × Disabled × Pending) | No story | ❌ MISSING | 🟡 Medium |

### Notes
- Figma Footer Primary Button: golden yellow (#F5CB5C-ish) background, black uppercase text, monospaced font, full-width, ~56-64px height, 4-6px border radius
- Storybook `button.stories.tsx` uses a generic Button component with `variant` (default/destructive/outline/secondary/ghost/link) and `size` props — this is a **shadcn-style button**, not the Figma footer buttons

### Discrepancies
| Issue | Priority |
|---|---|
| **Architecture mismatch:** Storybook has generic shadcn Button; Figma has specific Footer Primary/Secondary/Tertiary buttons with unique styling | 🔴 High |
| Figma Primary Button has golden yellow bg + black monospace text — verify this matches any existing implementation | 🔴 High |
| Figma specifies `Multiple=True` variants (for multi-action buttons) — not visible in stories | 🟡 Medium |
| Dropdown and Dropdown Menu components entirely missing | 🟡 Medium |
| Wallet-specific button variants (Metamask/Phantom) not in Storybook | 🟡 Medium |

---

## 5. Achievement Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| **Achievement Card Bits** | | | |
| Achievement Icons | `icons/index.stories.tsx` (partial) | ⚠️ PARTIAL | 🟡 Medium |
| Share Achievement Button | No story | ❌ MISSING | 🟢 Low |
| Achievement Header Button | No story | ❌ MISSING | 🟡 Medium |
| Achievement Status | No story | ❌ MISSING | 🟡 Medium |
| Task | No story | ❌ MISSING | 🟡 Medium |
| Achievement Label Group | No story | ❌ MISSING | 🟡 Medium |
| Points Tag | No story | ❌ MISSING | 🟡 Medium |
| Progress Bar | No story | ❌ MISSING | 🟡 Medium |
| Achievement Bits / Bits Group | No story | ❌ MISSING | 🟡 Medium |
| Achievement Content | No story | ❌ MISSING | 🟡 Medium |
| Achievement Card | No story (component exists: `modules/achievement-card.tsx`) | ⚠️ NO STORY | 🔴 High |
| Achievements Examples | No story | ❌ MISSING | 🟢 Low |
| **Achievement Tab Bits** | | | |
| Achievement Progress | No story | ❌ MISSING | 🟡 Medium |
| Player Header Block | `modules/player-header.stories.tsx` | ✅ EXISTS | — |
| Following tag | `modules/follow-tag.stories.tsx` | ✅ EXISTS | — |
| Social Group / Social Proof | `modules/game-social.stories.tsx` / `game-socials.stories.tsx` | ✅ EXISTS | — |
| Follow Button | `modules/follow-tag.stories.tsx` (partial) | ⚠️ PARTIAL | 🟡 Medium |
| Achievement Card (tab variant) | No story | ❌ MISSING | 🟡 Medium |
| Pinned Achievements | No story | ❌ MISSING | 🟡 Medium |
| Social Data | No story | ❌ MISSING | 🟢 Low |
| Player Header | `modules/player-header.stories.tsx` | ✅ EXISTS | — |
| **Leaderboard Tab Bits** | | | |
| Leaderboard Username | `modules/leaderboard-username.stories.tsx` | ✅ EXISTS | — |
| Achievement Group | No story | ❌ MISSING | 🟡 Medium |
| Pinned Achievement | No story | ❌ MISSING | 🟡 Medium |
| Leaderboard Row | `modules/leaderboard-row.stories.tsx` | ✅ EXISTS | — |
| Rank Badge | No story | ❌ MISSING | 🟢 Low |
| Following Tag | `modules/follow-tag.stories.tsx` | ✅ EXISTS | — |
| Leaderboard | No story | ❌ MISSING | 🟡 Medium |

### Discrepancies
| Issue | Priority |
|---|---|
| Achievement Card component exists (`modules/achievement-card.tsx`) but has NO story file | 🔴 High |
| Activity Achievement Card exists (`modules/activity-achievement-card.tsx`) but has NO story | 🔴 High |
| Achievement Pin Icons exist (`modules/achievement-pin-icon.tsx`, `achievement-pin-icons.tsx`) but have NO stories | 🟡 Medium |
| Most achievement sub-components (Progress Bar, Points Tag, Task, Status) have no stories | 🟡 Medium |

---

## 6. Arcade V2

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Nav Bar Tabs (12 variants: Active × Hover × Theme × Primary × Pill) | `modules/tab.stories.tsx` (partial) | ⚠️ PARTIAL | 🟡 Medium |
| Nav Bar (5 kinds: Game/Inventory/Collection/Asset/Prediction Market) | No story | ❌ MISSING | 🔴 High |
| Player Selected Banner (2 variants: Theme) | No story | ❌ MISSING | 🟡 Medium |

### Notes
- Figma V2 Nav Bar Tabs introduces `Primary` and `Pill` boolean props not present in current stories
- V2 Nav Bar has new kinds (Inventory, Asset, Prediction Market) beyond what current Nav Bar component supports
- Player Selected Banner is a new component with theme variants

### Discrepancies
| Issue | Priority |
|---|---|
| Arcade V2 Nav Bar with 5 route kinds is not implemented in Storybook | 🔴 High |
| V2 tabs add Primary + Pill variants not covered | 🟡 Medium |
| Player Selected Banner entirely missing | 🟡 Medium |

---

## 7. Activity Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Activity Feed Tokens | No story | ❌ MISSING | 🟡 Medium |
| Mobile Event Icons | No story | ❌ MISSING | 🟢 Low |
| Activity Feed Event (3 component sets) | No story | ❌ MISSING | 🔴 High |
| Achievement (activity variant) | No story | ❌ MISSING | 🟡 Medium |
| Achievement Bar | No story | ❌ MISSING | 🟡 Medium |
| Activity Card | No story | ❌ MISSING | 🔴 High |

### Notes
- `activity/ActivityView.tsx` exists but no individual component stories
- `modules/activity-achievement-card.tsx` exists without a story
- The entire activity feed section lacks Storybook coverage

---

## 8. Input Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Address Input | `form.stories.tsx` (partial) | ⚠️ PARTIAL | 🟡 Medium |
| String Input | `form.stories.tsx` (partial) | ⚠️ PARTIAL | 🟢 Low |
| Boutique Inputs | No story | ❌ MISSING | 🟢 Low |
| Amount Input | No story | ❌ MISSING | 🟡 Medium |
| Log In Input | No story | ❌ MISSING | 🟡 Medium |
| Integer Input (2 sets) | No story | ❌ MISSING | 🟢 Low |
| Social Log In Tray | No story | ❌ MISSING | 🟡 Medium |
| Social Log In Overlay | No story | ❌ MISSING | 🟡 Medium |

---

## 9. Icons

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Icons | `icons/index.stories.tsx` | ✅ EXISTS | — |
| Brand Icons - Color | `icons/index.stories.tsx` (partial) | ⚠️ PARTIAL | 🟢 Low |
| PFP Icons | No story | ❌ MISSING | 🟢 Low |
| Payment Method/Visa | No story | ❌ MISSING | 🟢 Low |
| Powered by Stripe | No story | ❌ MISSING | 🟢 Low |

---

## 10. Asset Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Collection Card | `carousel.stories.tsx` (partial) | ⚠️ PARTIAL | 🟡 Medium |
| Asset Card (3 component sets) | No story | ❌ MISSING | 🔴 High |
| Pill | No story | ❌ MISSING | 🟢 Low |
| Asset Header (2 sets) | No story | ❌ MISSING | 🟡 Medium |
| Select Checkbox / Checkbox States | No story | ❌ MISSING | 🟢 Low |
| Property / Asset Properties | No story | ❌ MISSING | 🟡 Medium |
| List Asset Card (2 variants) | No story | ❌ MISSING | 🟡 Medium |
| Asset Detail Page Sub Tabs | No story | ❌ MISSING | 🟡 Medium |
| ERC 1155 Details | No story | ❌ MISSING | 🟡 Medium |
| ERC 721 Details | No story | ❌ MISSING | 🟡 Medium |
| Sell Item Buttons | No story | ❌ MISSING | 🟡 Medium |
| ERC 1155 Items Group / Item Row | No story | ❌ MISSING | 🟡 Medium |
| For Sale Items | No story | ❌ MISSING | 🟡 Medium |
| Quantity Bar | No story | ❌ MISSING | 🟢 Low |
| Toggle | No story | ❌ MISSING | 🟢 Low |

---

## 11. Arcade Sidebar

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Game Select | `modules/game-select.stories.tsx` | ✅ EXISTS | — |
| Games List | No story | ❌ MISSING | 🟡 Medium |
| Trending Section (2 variants) | No story | ❌ MISSING | 🟡 Medium |
| Register Game Button | No story | ❌ MISSING | 🟢 Low |
| Register Game Tray | No story | ❌ MISSING | 🟢 Low |
| Edit Game Button | No story | ❌ MISSING | 🟢 Low |
| Game Select Pill (2 sets) | No story | ❌ MISSING | 🟡 Medium |
| Trending Card | No story | ❌ MISSING | 🟡 Medium |
| Input Header | No story | ❌ MISSING | 🟢 Low |
| User Card | No story | ❌ MISSING | 🟡 Medium |
| Quest Component (2 variants) | No story | ❌ MISSING | 🔴 High |
| Quest Card | No story | ❌ MISSING | 🔴 High |

---

## 12. About Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Gallery Header | No story (component: `about/AboutMedia.tsx`) | ⚠️ NO STORY | 🟡 Medium |
| Gallery | No story | ❌ MISSING | 🟡 Medium |
| Media Component | No story | ❌ MISSING | 🟡 Medium |
| Description | No story (component: `about/AboutDetails.tsx`) | ⚠️ NO STORY | 🟡 Medium |
| External Link Rows / Grid / Component | No story | ❌ MISSING | 🟡 Medium |

---

## 13. Explorer Components

| Figma Component | Storybook Story | Status | Priority |
|---|---|---|---|
| Chain ID | No story | ❌ MISSING | 🟢 Low |
| Header Buttons Right | No story | ❌ MISSING | 🟢 Low |
| Global Search Bar - Explorer | No story | ❌ MISSING | 🟡 Medium |
| Global Search Bar Card - Explorer | No story | ❌ MISSING | 🟡 Medium |
| Global Search Bar Dropdown - Explorer | No story | ❌ MISSING | 🟡 Medium |

---

## Components With Code But No Stories

These components exist in the codebase but lack Storybook stories:

| Component File | Priority |
|---|---|
| `modules/achievement-card.tsx` | 🔴 High |
| `modules/activity-achievement-card.tsx` | 🔴 High |
| `modules/achievement-pin-icon.tsx` | 🟡 Medium |
| `modules/achievement-pin-icons.tsx` | 🟡 Medium |
| `modules/arcade-header.tsx` | 🟡 Medium |
| `modules/layout-bottom-tabs.tsx` | 🟡 Medium |
| `modules/price-footer.tsx` | 🟡 Medium |
| `modules/summary.tsx` | 🟢 Low |
| `modules/tabs.tsx` | 🟢 Low |
| `modules/sub-tabs.tsx` | 🟢 Low |
| `modules/context-closer.tsx` | 🟢 Low |
| `about/AboutDetails.tsx` | 🟡 Medium |
| `about/AboutMedia.tsx` | 🟡 Medium |
| `about/AboutMetrics.tsx` | 🟡 Medium |
| `about/AboutView.tsx` | 🟡 Medium |
| `achievements/AchievementsSummaries.tsx` | 🟡 Medium |
| `achievements/AchievementsView.tsx` | 🟡 Medium |
| `achievements/TrophiesView.tsx` | 🟡 Medium |
| `activity/ActivityView.tsx` | 🟡 Medium |
| `navigation/NavigationView.tsx` | 🟢 Low |
| `positions/PositionCard.stories.tsx` | ✅ Has story |
| `predict/PredictCard.stories.tsx` | ✅ Has story |

---

## Priority Summary

### 🔴 High Priority (Implement First)

1. **Marketplace Collection Card** — Entirely missing from Storybook; complex component in Figma
2. **Marketplace Asset Card states** — Many Figma states (Selected, Listed, Broken, Multiple) may not be covered
3. **Button architecture mismatch** — Storybook has generic shadcn Button; Figma has specific Footer Primary/Secondary buttons with distinct styling (golden yellow, monospace text)
4. **Achievement Card story** — Component exists in code but has no story
5. **Activity Achievement Card story** — Component exists in code but has no story
6. **Activity Feed Event / Activity Card** — 4 component sets in Figma with zero story coverage
7. **Arcade V2 Nav Bar** — New navigation pattern with 5 route kinds, not represented
8. **Global Search Result** — 16 variants in Figma, no stories
9. **ERC 721 Marketplace Footer** — 12 complex variants, no stories
10. **Quest Component / Quest Card** — New sidebar components with no stories
11. **Asset Card** — 3 component sets in Figma's Asset Components section with no stories

### 🟡 Medium Priority

1. Tag Search Input / Improved Tag Search Input — complex input components
2. Game Menu Button — mobile navigation
3. Player Selected Banner — Arcade V2 component
4. V2 Nav Bar Tabs variants (Primary + Pill)
5. About section components (Gallery, Description, External Links)
6. Sidebar components (Games List, Trending Card/Section, User Card)
7. Dropdown + Dropdown Menu components
8. Achievement sub-components (Progress Bar, Points Tag, Status)
9. Input components (Amount, Login, Social Login)
10. Asset detail components (Properties, Sub Tabs, ERC details)

### 🟢 Low Priority

1. PFP Icons, Payment Method icons, Powered by Stripe
2. Register/Edit Game buttons
3. Rank Badge, Social Data
4. Checkbox States, Quantity Bar, Toggle
5. Explorer components (if not actively developed)

---

## Visual Comparison Notes

> ⚠️ **Browser automation was unavailable during this audit.** The following observations are based on Figma API image analysis and source code review.

### Button Styling Concern
The Figma Footer Primary Button uses a **distinctive golden yellow background with black monospaced uppercase text** — this is a very specific design language. The current Storybook `button.stories.tsx` showcases a generic shadcn/radix Button with standard variant/size props. There may be a dedicated footer button implementation elsewhere, or this represents a gap in the component library.

### Card Components
Figma card components (Game Card, Collection Card, Asset Card) have extensive state management through boolean props (Hover, Empty, Mobile, Broken, Listed, Selected). Storybook stories should ideally cover these key states to catch regressions.

### Theme Support
Many Figma components include a `Theme=True/False` variant, suggesting a theming system (likely game-specific color theming). Stories should test themed variants.

---

## Recommendations

1. **Create stories for existing unstorified components** — Quick wins for `achievement-card.tsx`, `activity-achievement-card.tsx`, `price-footer.tsx`, `arcade-header.tsx`
2. **Add Marketplace Collection Card** story matching the Figma design
3. **Expand button stories** to cover Footer Primary/Secondary button designs from Figma
4. **Add comprehensive state coverage** — especially Hover, Empty, Mobile, Broken, Listed, Selected states for card components
5. **Build Arcade V2 navigation stories** as the design evolves
6. **Add visual regression testing** (e.g., Chromatic) to catch drift between Figma and implementation
7. **Consider Storybook interaction tests** for hover/focus states that Figma defines as variants
