# DT-894: Fix Styling for Content Page

- **Sprint**: Sprint 9
- **Story ID**: DT-894
- **Subtasks**:
  - `DT-917`: Fix styling overflow on content page
  - `DT-918`: Fix dark mode toggle for content page

## Summary

Resolved CSS overflow and dark/light mode discrepancies on the dynamic Content Page (`ContentPage.jsx`) so that all modular sections and cards render with the exact colors, backgrounds, and layout alignment shown in the Content Editor live preview across both Light Mode and Dark Mode.

## Changes

- **DT-917 (Fix styling overflow on content page)**:
  - Updated `client/src/styles/contentpage.css` to enforce `overflow-x: hidden`, `box-sizing: border-box`, and `min-width: 0` on `.content-page` and `.content-page-sections` so stacked sections cannot overflow horizontally.
  - Updated `client/src/components/modular/sections/CardSection.jsx` and `client/src/styles/components/modular/sections/CardSection.css` to wrap the card grid in `.card-section__inner` (`max-width: 1200px; margin: 0 auto;`) while making `.card-section` span full width (`width: 100%; background-color: var(--section-bg, #ffffff); color: var(--section-text, #1e293b); padding: 4rem 1.5rem;`), matching all other modular sections and the Content Editor preview.
  - Updated `CardSection.jsx` to support up to 5 columns (`--card-columns: Math.min(Math.max(columns, 1), 5)`) with `min-width: 0` on grid items so 4- and 5-column sections never overflow horizontally.
  - Aligned the preview wrappers in `PageManager.jsx` and `SectionManager.jsx` with the `ContentPage.jsx` section flow.
- **DT-918 (Fix dark mode toggle for content page)**:
  - Connected `client/src/pages/ContentPage.jsx` to `useAccessibility()` from `AccessibilityContext.jsx` and passed the active `theme` (`'light'` or `'dark'`) to both the reference page adapters (`WelcomeSections`, `HomeHealthSections`, `HospiceSections`) and `DynamicSectionRenderer`, preserving `DT-902` global colour source handling alongside CMS direct element colors.
  - Updated `contentpage.css` to replace hardcoded light colors with theme-aware CSS variables while preserving `.content-page--standard` global palette rules.

## Files Modified

- `client/src/pages/ContentPage.jsx`
- `client/src/styles/contentpage.css`
- `client/src/components/modular/DynamicSectionRenderer.jsx`
- `client/src/components/modular/sections/CardSection.jsx`
- `client/src/styles/components/modular/sections/CardSection.css`
- `client/src/styles/components/modular/sections/ContactFormSection.css`
- `client/src/components/admin/content/PageManager.jsx`
- `client/src/components/admin/content/SectionManager.jsx`
