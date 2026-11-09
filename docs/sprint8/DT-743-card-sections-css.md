# DT-743: Centralize Card Styling

## Summary

Moved shared and page-specific card styling into `card-sections.css` so card presentation has one source of truth. Page-specific card styles are now scoped by section wrappers when possible, such as `.welcome-info-section .card` and `.portals-section .card`.

## Changes

- Reorganized `client/src/styles/card-sections.css` into shared card primitives and scoped sections for welcome, portal, Home Health, Hospice, form, and legacy info cards.
- Added a `portals-section` wrapper around portal dashboard cards in `client/src/pages/PortalPage.jsx` so portal card styling can be scoped while preserving reusable `.card` class names.
- Removed duplicate card rules from `portal.css`, `homehealth.css`, `HospicePage.css`, and `LandingPage.css` after migrating them to the shared card stylesheet.

## Files Modified

- `client/src/styles/card-sections.css`
- `client/src/pages/PortalPage.jsx`
- `client/src/styles/portal.css`
- `client/src/styles/homehealth.css`
- `client/src/styles/HospicePage.css`
- `client/src/styles/LandingPage.css`
- `docs/sprint8/DT-743-card-sections-css.md`

## Sprint 08 follow-up: shared appearance and hover behavior

- Centralized card surfaces in `.card` / `.card-surface`, with shared 12px corners (`--radius-lg`) and CSS variables for intentional background, border, and padding differences.
- Added opt-in `.card-section--hover` and `.card-hover` styles: primary-green border, 5px upward lift, and 0.2-second transitions. Applied to Home Health services, advantages, specialties, and Hospice modular information sections.
- Kept Welcome cards static and removed the Above and Beyond hover color change. Above and Beyond shares the surface and radius without opting into motion.
- Preserved section typography, layout, colors, and portal border-only hover behavior; removed the legacy mobile info-card radius override and moved remaining legacy Hospice card surface styles into the shared stylesheet.
- No component API, translation, content, or database changes.

### Additional files modified

- `client/src/pages/HomeHealthPage.jsx`
- `client/src/pages/HospicePage.jsx`
- `client/src/styles/responsive.css`

### Validation

- Client production build: passed (existing dependency directive and bundle-size warnings).
- `git diff --check`: passed.
- Reviewed CSS selectors and desktop/mobile rules for shared radius, opt-in hover coverage, static Welcome/Above and Beyond behavior, and unchanged portal hover behavior.
- Browser visual checks remain pending; no browser automation tool is available in this session.

## Standalone section layouts

The next DT-743 increment adds Header/Cards, Header/Stack, and Timeline presentation components with an isolated preview. See [DT-743 reusable section layouts](DT-743-reusable-section-layouts.md) for interfaces, usage, future editor mapping, modified files, and validation. Existing public sections and the content manager are unchanged by this increment.
