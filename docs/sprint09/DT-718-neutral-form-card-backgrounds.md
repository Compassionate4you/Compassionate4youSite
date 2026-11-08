# DT-718: Neutral contact form and grey card backgrounds

Sprint: **09**

Superseded by DT-902: the separate page stylesheet and literal colour overrides were removed. See `DT-902-section-layout-styles.md` for the global-token implementation and current verification.

## Changes

- Scoped the dark contact form to a charcoal panel, darker inputs, neutral grey borders and placeholders, white text, and grey focus and submit-button styles. Light-mode form styling and the surrounding contact section remain unchanged.
- Changed photo/text card interiors to the existing light-grey theme token: `#D9D9D9` in light mode and `#353535` in dark mode. Images, layout, borders, and typography remain unchanged.
- Preserved validation and success colors and existing hover/disabled button behavior. No component API or submission logic changes.

## Files modified

- `client/src/styles/ContentPageTheme.css`
- `client/src/styles/components/modular/cards/PhotoTextCard.css`
- `docs/sprint09/DT-718-neutral-form-card-backgrounds.md`

## Validation

- `npm run build` passed. Vite reported dependency directive, mixed-import, and large-bundle warnings.
- `npm test -- src/components/__tests__/ContactForm.test.jsx` passed: 25 tests.
- `git diff --check` passed.
- Reviewed CSS scope and cascade: dark overrides apply only to the contact form; error borders retain their existing `!important` priority, and existing button hover/disabled rules remain active.
- Browser visual verification remains pending: local headless Chrome exited with code 134 before rendering the desktop fixture, so desktop/mobile appearance could not be confirmed here.
