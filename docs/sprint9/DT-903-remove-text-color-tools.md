# DT-903: Remove Text Config and Color Config Tools

- **Sprint**: Sprint 9
- **Story ID**: DT-903
- **Subtasks**:
  - `DT-919`: Remove text and color tools from content editor toolbar
  - `DT-920`: Create color editing component to be used within style selector
  - `DT-921`: Remove color table from database (API/controller decoupled; physical migration deferred per team coordination)
  - `DT-922`: Store colors directly within saved elements

## Summary

Removed the standalone Text Config and Color Config tools from the Content Editor toolbar and embedded dual Light/Dark mode color editing directly into the `Colors & Theme` style tabs of `SectionManager` and `CardManager`. Section and card elements now store their `{ light, dark }` color pairs directly inside each saved element rather than referencing a separate `colors` table.

## Changes

- **DT-919 (Remove text and color tools from content editor toolbar)**:
  - Removed the `📝 Text Config` and `🎨 Color Config` tabs and workspace views from `client/src/pages/ContentEditor.jsx`.
- **DT-920 (Create color editing component to be used within style selector)**:
  - Created `client/src/components/admin/content/ColorEditor.jsx` providing `ColorEditor` and `ColorPickerField` with dual Light Mode (`☀️`) and Dark Mode (`🌙`) color wheel pickers (`<input type="color">`), hex inputs, brand color presets, and reset controls.
  - Integrated `ColorEditor` into the `🎨 Colors & Theme` subtab of both `SectionManager.jsx` and `CardManager.jsx` across Create and Manage modes.
- **DT-921 (Remove color table usage from backend/frontend)**:
  - Removed `/colors` routes and controller handlers from `server/src/routes/contentRoutes.js` and `server/src/controllers/contentController.js`.
  - Removed `ColorConfigService` usage from `ContentPage.jsx`, `DynamicSectionRenderer.jsx`, `ModularCard.jsx`, `SectionManager.jsx`, and `CardManager.jsx` (physical database migration dropping `colors` held back temporarily to avoid disrupting other developers).
- **DT-922 (Store colors directly within saved elements)**:
  - Updated `SectionManager.jsx`, `CardManager.jsx`, `sectionStorageService.js`, `cardStorageService.js`, `contentController.js`, and `seed-cms-content.js` to store `{ light, dark }` hex color objects directly inside each section and card (`content.colors` and `colors`).
  - Updated `DynamicSectionRenderer.jsx` and `ModularCard.jsx` to resolve light and dark colors directly from each element via `resolveElementColor`.
  - Updated `AuditHistoryTool.jsx` to format `{ light, dark }` color objects cleanly in before/after audit diffs.

## Files Added

- `client/src/components/admin/content/ColorEditor.jsx`
- `docs/sprint9/DT-903-remove-text-color-tools.md`

## Files Modified

- `client/src/pages/ContentEditor.jsx`
- `client/src/components/admin/content/SectionManager.jsx`
- `client/src/components/admin/content/CardManager.jsx`
- `client/src/components/admin/content/AuditHistoryTool.jsx`
- `client/src/components/modular/DynamicSectionRenderer.jsx`
- `client/src/components/modular/cards/ModularCard.jsx`
- `client/src/services/sectionStorageService.js`
- `client/src/services/cardStorageService.js`
- `server/src/controllers/contentController.js`
- `server/src/routes/contentRoutes.js`
- `server/prisma/seed-cms-content.js`
- `server/src/controllers/__tests__/contentController.test.js`
