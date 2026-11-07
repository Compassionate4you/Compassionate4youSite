# DT-718: Stop tracking local preview files

Sprint: **09**

## Changes

- Ignore `client/src/previews/` and `client/section-layouts-preview.html` in the root `.gitignore`.
- Remove the preview component, stylesheet, and HTML entry from Git tracking while retaining local copies. Existing Git history is preserved.
- Leave application code and unrelated untracked files untouched.

## Files modified

- `.gitignore`
- `client/src/previews/SectionLayoutsPreview.jsx` (untracked; retained locally)
- `client/src/previews/section-layouts-preview.css` (untracked; retained locally)
- `client/section-layouts-preview.html` (untracked; retained locally)
- `docs/sprint09/DT-718-preview-tracking-cleanup.md`

## Validation

- All three preview files still exist locally, match the new ignore rules, and no longer appear in `git ls-files`.
- Working-tree and staged `git diff --check` passed.
- `npm run build` passed with existing dependency directive, mixed-import, and bundle-size warnings.

## Delivery

- Commit this cleanup and push `David-Gonzalez` to `origin/David-Gonzalez`, including the branch's existing local commits, using a normal push.
