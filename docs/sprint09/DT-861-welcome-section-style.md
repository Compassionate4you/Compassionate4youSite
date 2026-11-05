# DT-861: Welcome Page — About, Caring, and Philosophy style

Sprint: **09**

## Changes

Added a reusable centered banner style matching the revised design reference: rounded pale panels, a light-green circular icon badge between sage divider lines, serif headings, and centered body copy. Responsive spacing and typography allow long content to expand naturally on narrow screens. Styles use existing theme tokens, including dark surfaces and readable text in dark mode.

The isolated section preview displays three examples above the existing DT-743 layouts, using the existing English Welcome translation content:

- About: Lucide `Users`.
- Caring Since 2021: Lucide `HeartHandshake`.
- Our Philosophy: Lucide `Heart`.

Each section has a uniquely linked heading; decorative icons and dividers are hidden from assistive technologies. The existing examples and controls remain available. No live Welcome page integration, content-manager changes, public component API, or new image assets are included.

## Reuse and preview

Load `global.css` and `section-layouts.css`. Use `c4-welcome-banners` for the spaced container and `c4-welcome-banner` for each semantic section. Inside each section, use `c4-welcome-banner__ornament` around `c4-welcome-banner__badge`, followed by `c4-welcome-banner__title` and `c4-welcome-banner__description`. The preview supplies the complete markup example.

From `client/`, run `npm run dev` and open `/section-layouts-preview.html`. The existing Dark theme checkbox also themes the new banners.

## Files modified

- `client/src/styles/section-layouts.css`
- `client/src/previews/SectionLayoutsPreview.jsx`
- `docs/sprint09/DT-861-welcome-section-style.md`

## Validation

- Site production build and separate preview-entry production build passed. Builds retain dependency directive warnings; the site build also reports a large bundle warning.
- Targeted JavaScript Standard Style check passed with its cache redirected to a writable temporary directory.
- Headless Chrome measured layouts at 1536px, 834px, 390px, and 320px in light and dark modes: no horizontal page or panel overflow. Inspected desktop/mobile screenshots and confirmed distinct icons and existing Welcome copy.
- Verified final dark-mode surfaces and white text with browser transitions disabled during measurement; badge icons remain black on pale green.
- Legacy portal card color, background, padding, border radius, width, and font size were unchanged when the new banner rules were disabled in the browser.
- `git diff --check` passed.
