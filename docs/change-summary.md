# Summary of Current Workspace Changes

This document details all currently modified, added, and deleted files in the workspace, grouped by functional area. For each group, it explains **why** the changes were made and **how** they change application behavior.

---

## 1. Unification of Public Pages Under `DynamicSectionRenderer` (Removal of Hardcoded Page Adapters)

### Reason
Previously, `/welcome`, `/home-health`, and `/hospice` bypassed the CMS rendering pipeline via dedicated page-adapter components (`WelcomeSections.jsx`, `HomeHealthSections.jsx`, `HospiceSections.jsx`). Those adapters hardcoded layout structures, copy, and overrides instead of rendering the actual sections stored in the database. This created a mismatch between what admins edited in the Content Editor and what visitors saw on public pages.

### Behavior Changes
- **`ContentPage.jsx`**: Removed imports and dispatch logic for `WelcomeSections`, `HomeHealthSections`, and `HospiceSections`. All pages now render their database-configured sections directly through `DynamicSectionRenderer` inside a consistent `.content-page.content-page--standard` container. The fallback `<h1>` page header is only rendered when a non-landing page has no hero section (`WELCOME_HERO`, `HERO_SECTION`, `FULLSCREEN_IMAGE_HEADER`).
- **Deleted Adapters**: Removed `WelcomeSections.jsx`, `HomeHealthSections.jsx`, and `HospiceSections.jsx` now that `DynamicSectionRenderer` handles all layouts natively.
- **`DynamicSectionRenderer.jsx`**:
  - Added dispatch for `LOCATION_MAPS` (and `MAP_SECTION` with `useDynamicLocations: true`) using `LocationMaps` with a `MapSection` fallback.
  - Applied tone-specific split hero classes (`c4-home-health-hero`, `c4-hospice-hero`) automatically for `HERO_SECTION` split variants.
  - Added support for configurable primary and secondary links (`primaryLink` / `homeLink`) in `PAGE_CTA` and inline bullet parsing (`- ` lines) for `HEADER_CARDS`, `HEADER_STACK`, and `TIMELINE_SECTION`.
- **`CardSection.jsx`**: Detects when all resolved cards use `PHOTO_TEXT_CARD` / `PHOTO_TEXT` and wraps them in `.c4-photo-cards` so Welcome photo-card sections keep their alternating bordered presentation without needing `WelcomeSections`.
- **`BannerSection.jsx`**: Extended `welcomeIcons` map with seeded section IDs (`sec-landing-philosophy`, `sec-landing-caring`, `sec-landing-about`) so decorative banners retain their icons when rendered generically.
- **`LocationMaps.jsx`**: Accepts `hideHeading` and `style` props and forwards them to each dynamically generated `MapSection`.
- **`PageCallToAction.jsx`**: Supports configurable `primaryLink`, `homeLink`, and external `http*` links, and omits links when their label is empty.
- **`sections/index.js`**: Re-exported `BannerSection`, `HeroSection`, `LocationMaps`, `PageCallToAction`, and `WelcomeHeroSection` alongside existing modular section exports.

### Files Changed
- Deleted:
  - `client/src/components/modular/HomeHealthSections.jsx`
  - `client/src/components/modular/HospiceSections.jsx`
  - `client/src/components/modular/WelcomeSections.jsx`
- Modified:
  - `client/src/pages/ContentPage.jsx`
  - `client/src/components/modular/DynamicSectionRenderer.jsx`
  - `client/src/components/modular/sections/CardSection.jsx`
  - `client/src/components/modular/sections/BannerSection.jsx`
  - `client/src/components/modular/sections/LocationMaps.jsx`
  - `client/src/components/modular/sections/PageCallToAction.jsx`
  - `client/src/components/modular/sections/index.js`

---

## 2. Color Management Coverage Across All Section & Card Layouts + Contrast Guards

### Reason
An audit of all 15 section layouts and 4 card layouts revealed two major defects:
1. Several layouts (`WelcomeHeroSection`, `HeroSection`, `HeaderCardsSection`, `HeaderStackSection`, `TimelineSection`, `PageCallToAction`, `HeaderTextSection` wrapper, `PhotoTextCard`, and cards referenced via `cardIds`) did not receive or consume `--section-*` / `--card-*` CSS custom properties, causing changes in the inline Color Editor to have no visual effect.
2. Bright dark-mode accent colors (e.g., `#4ade80`) paired with white button/badge text, as well as low-contrast database records (e.g., white text on white background in light mode or dark slate text on dark slate background in dark mode on `/hospice` and `/home-health` heroes), caused unreadable text.

### Behavior Changes
- **Contrast Utilities (`ColorEditor.jsx`)**:
  - Added `hexLuminance`, `getContrastTextColor` (returns `#0f172a` for bright backgrounds or `#ffffff` for dark backgrounds), and `ensureReadableTextColor` (checks relative luminance contrast ratio; when `< 1.8`, falls back to `#0f172a` on light backgrounds or `#f8fafc` on dark backgrounds).
- **Renderer Color Forwarding (`DynamicSectionRenderer.jsx`, `ModularCard.jsx`)**:
  - Computes `--section-accent-text` automatically from the resolved `--section-accent` color.
  - Guards `--section-header`, `--section-text`, `--card-header`, and `--card-text` with `ensureReadableTextColor` when `colorSource === 'cms'`, while preserving `colorSource === 'global'` behavior without querying CMS color storage.
  - Forwards `style={customStyles}` to `WelcomeHeroSection`, `HeroSection`, `HeaderCardsSection`, `HeaderStackSection`, `TimelineSection`, `PageCallToAction`, `HeaderTextSection`, and `PhotoTextCard` (plus `typography` on `PhotoTextCard`).
  - Resolves per-card `--card-bg`, `--card-header`, and `--card-text` styles for referenced `cardIds` inside `HeaderCardsSection` and `HeaderStackSection`.
- **Section & Card Stylesheet Token Wiring**:
  - Updated all modular section stylesheets to read `var(--section-bg, ...)`, `var(--section-header, ...)`, `var(--section-text, ...)`, `var(--section-accent, ...)`, and `var(--section-accent-text, ...)` rather than hardcoded colors or non-overridable palette variables (notably fixing hardcoded sage/green rules in `ContactFormSection.css`, white overlay backdrops in `FullscreenImageHeaderSection.css`, link colors in `contentpage.css`, and `#ffffff`/`#1e293b` fallbacks in `CardSection.css`).
  - Updated all 4 card stylesheets (`HeaderParagraphCard.css`, `HeaderSymbolCard.css`, `ImageCard.css`, `PhotoTextCard.css`) to consume `--card-bg`, `--card-header`, and `--card-text`, added subtle theme-aware borders (`color-mix(...)`) so cards remain visually separated in dark mode, added `align-self: stretch` on `ImageCard` images, and added paragraph spacing on `HeaderSymbolCard`.
  - Added `min-width: 0` to `ImageHeaderTextSection.css` flex columns to prevent narrow-viewport horizontal overflow.

### Files Changed
- Components:
  - `client/src/components/admin/content/ColorEditor.jsx`
  - `client/src/components/modular/DynamicSectionRenderer.jsx`
  - `client/src/components/modular/cards/ModularCard.jsx`
  - `client/src/components/modular/cards/PhotoTextCard.jsx`
  - `client/src/components/modular/sections/WelcomeHeroSection.jsx`
  - `client/src/components/modular/sections/HeroSection.jsx`
  - `client/src/components/modular/sections/HeaderCardsSection.jsx`
  - `client/src/components/modular/sections/HeaderStackSection.jsx`
  - `client/src/components/modular/sections/TimelineSection.jsx`
  - `client/src/components/modular/sections/PageCallToAction.jsx`
  - `client/src/components/modular/sections/HeaderTextSection.jsx`
- Stylesheets:
  - `client/src/styles/contentpage.css`
  - `client/src/styles/components/modular/sections/SectionShared.css`
  - `client/src/styles/components/modular/sections/BannerSection.css`
  - `client/src/styles/components/modular/sections/HeroSection.css`
  - `client/src/styles/components/modular/sections/HeaderCardsSection.css`
  - `client/src/styles/components/modular/sections/HeaderStackSection.css`
  - `client/src/styles/components/modular/sections/TimelineSection.css`
  - `client/src/styles/components/modular/sections/ContactFormSection.css`
  - `client/src/styles/components/modular/sections/FullscreenImageHeaderSection.css`
  - `client/src/styles/components/modular/sections/AccountBenefitsSection.css`
  - `client/src/styles/components/modular/sections/ImageHeaderTextSection.css`
  - `client/src/styles/components/modular/sections/MapSection.css`
  - `client/src/styles/components/modular/sections/CardSection.css`
  - `client/src/styles/components/modular/cards/HeaderParagraphCard.css`
  - `client/src/styles/components/modular/cards/HeaderSymbolCard.css`
  - `client/src/styles/components/modular/cards/ImageCard.css`
  - `client/src/styles/components/modular/cards/PhotoTextCard.css`

---

## 3. Dark Mode Theme Scoping & Editor Live Preview Alignment

### Reason
`global.css` previously defined light variables only on `:root` and dark variables only on `[theme='dark']`. Because Content Editor live preview containers did not set matching `theme` / `data-theme` attributes—and `[theme='light']` did not re-establish light CSS tokens inside a dark outer page—toggling Light/Dark preview in the admin managers left global CSS tokens stuck in the outer page's theme. Additionally, `ColorEditor` hex inputs had white backgrounds with inherited light text when viewed in dark mode.

### Behavior Changes
- **`global.css`**:
  - Scoped light-mode custom properties to `:root, [theme='light'], [data-theme='light']` and dark-mode custom properties to `[theme='dark'], [data-theme='dark']`.
  - Added dark-mode tokens for `--color-success` (`#4ade80`), `--color-danger` (`#f87171`), and `--color-danger-hover` (`#ef4444`) so status and validation messages remain legible in dark mode.
- **`ContentPage.jsx`, `SectionManager.jsx`, `CardManager.jsx`, `PageManager.jsx`**:
  - Applied both `theme={...}` and `data-theme={...}` to page root and live-preview containers so preview switches update all CSS variables independently of the global accessibility toggle.
- **`ColorEditor.jsx`**:
  - Added explicit `color: '#0f172a'` on Light/Dark hex text inputs so hex codes stay readable against their `#ffffff` input backgrounds in dark mode.

### Files Changed
- `client/src/styles/global.css`
- `client/src/pages/ContentPage.jsx`
- `client/src/components/admin/content/SectionManager.jsx`
- `client/src/components/admin/content/CardManager.jsx`
- `client/src/components/admin/content/PageManager.jsx`
- `client/src/components/admin/content/ColorEditor.jsx`

---

## 4. Multilingual Field Unwrapping & Bundled Image Asset Resolution

### Reason
After removing hardcoded page adapters, CMS sections stored in the database often contain multilingual objects (`{ en: '...', es: '...', ... }`) and legacy pre-Vite image paths (`/assets/images/...` or `/images/...`). Several modular components rendered raw strings or raw URLs directly, causing broken images or `[object Object]` rendering when given localized CMS records.

### Behavior Changes
- **Image Asset Resolution (`resolveImageUrl.js`, `ImageCard.jsx`, `HeaderCardsSection.jsx`, `ImageHeaderTextSection.jsx`, `FullscreenImageHeaderSection.jsx`)**:
  - Registered three additional bundled site images (`compassion_image3.jpeg`, caregiver wheelchair photo, `CompassionateLogo.jpeg`) in `resolveImageUrl.js`.
  - Wired `resolveImageUrl()` into `ImageCard`, `HeaderCardsSection`, `ImageHeaderTextSection`, and `FullscreenImageHeaderSection` so legacy `/assets/images/...` and `/images/...` paths resolve to Vite-bundled asset URLs (while preserving external/custom URLs).
- **Localized Text Unwrapping (`AccountBenefitsSection.jsx`, `ContactFormSection.jsx`, `FAQSection.jsx`, `MapSection.jsx`, `ImageHeaderTextSection.jsx`, `FullscreenImageHeaderSection.jsx`, `SectionManager.jsx`)**:
  - Used `pickText(value, lang)` across section titles, subtitles, contact details, FAQ items, benefit items, map labels/addresses, image alt text, and button text so multilingual JSON records automatically display in the active i18next language (and unwrap cleanly to English strings when edited in `SectionManager`).

### Files Changed
- `client/src/components/modular/resolveImageUrl.js`
- `client/src/components/modular/cards/ImageCard.jsx`
- `client/src/components/modular/sections/HeaderCardsSection.jsx`
- `client/src/components/modular/sections/ImageHeaderTextSection.jsx`
- `client/src/components/modular/sections/FullscreenImageHeaderSection.jsx`
- `client/src/components/modular/sections/AccountBenefitsSection.jsx`
- `client/src/components/modular/sections/ContactFormSection.jsx`
- `client/src/components/modular/sections/FAQSection.jsx`
- `client/src/components/modular/sections/MapSection.jsx`
- `client/src/components/admin/content/SectionManager.jsx`

---

## 5. Content Editor (`SectionManager` & `CardManager`) Layout Controls & Live DB Sync

### Reason
With all public pages driven directly by database CMS records, the Content Editor needed full parity with every modular layout—including `WELCOME_HERO`, `LOCATION_MAPS`, inline card items, typography controls, secondary CTA links, and automatic database synchronization on mount so dropdowns and card lists are never stale.

### Behavior Changes
- **Database Sync on Mount (`SectionManager.jsx`, `CardManager.jsx`)**:
  - Both managers now fetch fresh pages, sections, and cards from the database via `loadFromDatabase()` on mount instead of reading stale in-memory snapshots once.
- **Expanded Layout Support (`SectionManager.jsx`)**:
  - Added `WELCOME_HERO` and `LOCATION_MAPS` to `LAYOUT_OPTIONS` and normalized legacy layout aliases (`BANNER_SECTION` → `HEADER_TEXT`, `CARD_SECTION` → `CARD_GRID`, `CONTACT_SECTION` → `CONTACT_FORM`, `FAQ` → `FAQ_SECTION`).
  - Added state, dirty-tracking, persistence, reset-on-create, and live-preview wiring for `secondaryButtonLink` and `useDynamicLocations`.
- **Per-Layout Form Enhancements**:
  - `HeaderCardsLayout.jsx`: Added header/subtitle `TypographyControls` and a full inline card-item editor (add, reorder, remove, title, Lucide icon selector, bullet-list description).
  - `HeaderStackLayout.jsx` & `TimelineSectionLayout.jsx`: Added header and subtitle `TypographyControls`.
  - `HeroSectionLayout.jsx`: Added header/description `TypographyControls`, a `light-green` tone option, and conditional hiding of non-applicable fields when `isWelcomeHero` or `heroVariant === 'welcome'` is active.
  - `MapSectionLayout.jsx`: Added dynamic-locations toggle (`useDynamicLocations`) and informational banner for `LOCATION_MAPS` mode.
  - `PageCallToActionLayout.jsx`: Added header/description `TypographyControls` and editable `Primary Action Link` / `Secondary / Home Action Link` URL inputs.

### Files Changed
- `client/src/components/admin/content/CardManager.jsx`
- `client/src/components/admin/content/SectionManager.jsx`
- `client/src/components/admin/content/SectionManager/HeaderCardsLayout.jsx`
- `client/src/components/admin/content/SectionManager/HeaderStackLayout.jsx`
- `client/src/components/admin/content/SectionManager/HeroSectionLayout.jsx`
- `client/src/components/admin/content/SectionManager/MapSectionLayout.jsx`
- `client/src/components/admin/content/SectionManager/PageCallToActionLayout.jsx`
- `client/src/components/admin/content/SectionManager/TimelineSectionLayout.jsx`

---

## 6. Removal of Hardcoded Dummy Fallback Data & Disabling CMS Seed Scripts

### Reason
The client storage services previously fell back to hardcoded `INITIAL_CARDS`, `INITIAL_COLORS`, `INITIAL_PAGES`, and `INITIAL_SECTIONS` arrays—and ignored empty arrays returned from the API—causing deleted or empty database states to silently revert to stale mock data. Similarly, the Prisma CMS seed scripts contained legacy dummy/static seeding logic that is no longer intended to run automatically.

### Behavior Changes
- **Client Storage Services (`cardStorageService.js`, `colorConfigService.js`, `pageStorageService.js`, `sectionStorageService.js`)**:
  - Removed hardcoded `INITIAL_*` arrays; services now default to `[]` when `localStorage` is empty or unreadable.
  - Updated `loadFromDatabase()` to accept any valid JSON array (`Array.isArray(...)`), including an empty array `[]`, so the database is always the source of truth.
- **Prisma Seed Scripts (`seed-card-helpers.js`, `seed-cards.js`, `seed-cms-content.js`, `seed-section-defs.js`)**:
  - Commented out CMS database seeding logic with a notice explaining that dummy fallback seeding is disabled.

### Files Changed
- `client/src/services/cardStorageService.js`
- `client/src/services/colorConfigService.js`
- `client/src/services/pageStorageService.js`
- `client/src/services/sectionStorageService.js`
- `server/prisma/seed-card-helpers.js`
- `server/prisma/seed-cards.js`
- `server/prisma/seed-cms-content.js`
- `server/prisma/seed-section-defs.js`

---

## 7. Scheduling Page Container Width Adjustment

### Reason
Adjusted the content container width on the scheduling page from a fixed pixel cap to a fluid percentage width for wider desktop screens.

### Behavior Changes
- **`scheduling.css`**: Changed `.content` from `max-width: 960px` to `max-width: 75%`.

### Files Changed
- `client/src/styles/scheduling.css`

---

## 8. Automated Test Suite Updates & New Layout/Color/Theme Coverage

### Reason
Removing the legacy page adapters invalidated adapter-specific tests and fixtures, while the new layout styling, color management, contrast guard, and dark-mode changes needed dedicated automated regression coverage.

### Behavior Changes
- **Added `AllLayoutsStylingAndTheme.test.jsx` (43 tests)**:
  - Verifies all 15 section layouts and all 4 card layouts apply custom light/dark `--section-*` / `--card-*` CSS variables and `--section-accent-text` contrast colors.
  - Verifies `ensureReadableTextColor` guards unreadable light-on-light and dark-on-dark combinations on both sections and cards.
  - Verifies `resolveImageUrl` asset resolution on `ImageCard` and `PhotoTextCard`, `ColorEditor` input contrast and state updates, `SectionManager`/`CardManager` live preview `theme`/`data-theme` toggles, and CSS custom property wiring across all stylesheets.
- **Updated Existing Tests**:
  - `highlightsOnRealPages.test.jsx`, `contentEditorFormatting.test.jsx`, `GlobalColors.test.jsx`, `ContentPageLayouts.test.jsx`, and `ContentPageWelcome.test.jsx` were migrated from the deleted page adapters to test `DynamicSectionRenderer` directly.
- **Deleted Obsolete Adapter Tests & Fixtures**:
  - Removed `HomeHealthSections.test.jsx`, `HospiceSections.test.jsx`, `ReferenceContent.test.jsx`, and `fixtures/sprint08-content.json`.

### Files Changed
- Added:
  - `client/src/components/modular/__tests__/AllLayoutsStylingAndTheme.test.jsx`
- Modified:
  - `client/src/components/chatbot/__tests__/highlightsOnRealPages.test.jsx`
  - `client/src/components/modular/__tests__/contentEditorFormatting.test.jsx`
  - `client/src/components/modular/sections/__tests__/GlobalColors.test.jsx`
  - `client/src/pages/__tests__/ContentPageLayouts.test.jsx`
  - `client/src/pages/__tests__/ContentPageWelcome.test.jsx`
- Deleted:
  - `client/src/components/modular/sections/__tests__/HomeHealthSections.test.jsx`
  - `client/src/components/modular/sections/__tests__/HospiceSections.test.jsx`
  - `client/src/components/modular/sections/__tests__/ReferenceContent.test.jsx`
  - `client/src/components/modular/sections/__tests__/fixtures/sprint08-content.json`
