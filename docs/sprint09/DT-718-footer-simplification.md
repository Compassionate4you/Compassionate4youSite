# DT-718: Simplify the public footer

Sprint: **09**

## Changes

- Show Contact Us and Office Hours across public pages; remove company branding, tagline, and Quick Links. Restore the centered, white copyright line with the current year and existing translation.
- Use the existing white footer text variable for contact details, address, and office hours. Remove unused styles and variables associated with deleted content.
- Keep Contact Us and Office Hours in equal columns across the available footer width, removing the previous 960px grid and 320px content limits.
- Arrange phone, email, and address horizontally with wrapping; arrange weekday, Saturday, and Sunday groups the same way. Use matching gaps and top alignment, and remove the old weekend indentation.
- Stack sections below 640px; allow items and long text to wrap without overflow. Preserve multiline addresses and day/time pairs.
- Preserve translated content, phone and map destinations, background, keyboard focus indicators, and admin-route hiding. The separate admin footer is unchanged.
- Add DT-718 comments while preserving previous story comments.

## Files modified

- `client/src/components/layout/Footer.jsx`
- `client/src/components/layout/styles/footer.css`
- `docs/sprint09/DT-718-footer-simplification.md`

## Validation

- `npm run build` passed with existing dependency directive, mixed-import, and bundle-size warnings.
- `git diff --check` passed.
- One-off server-render checks passed on `/welcome`, `/home-health`, and `/hospice`: two headings, contact links, weekday/weekend hours, translated copyright, and current year are present; branding and Quick Links are absent. `/admin` and `/admin/dashboard` render no public footer.
- Reviewed responsive CSS: equal columns use the available footer width; detail lists use horizontal flex rows with wrapping and matching gaps; sections stack below 640px; item widths and text wrapping accommodate narrow columns. All text remains white.
- Desktop/mobile appearance, horizontal overflow, and browser interaction checks remain unconfirmed: installed headless Chrome previously exited with code 134 before rendering.
