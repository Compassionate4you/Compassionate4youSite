# DT-743: Reusable section layouts

Sprint: **08**

## Summary

Added three standalone presentation components matching the supplied Header/Cards, Header/Stack, and care-process timeline references. They are ready to receive content from a future editor adapter. The content manager, dynamic renderer, persistence, database, existing translations, and live page sections are unchanged.

All styles are scoped under `c4-` classes. Colors come from the Base Site Colors variables in `global.css` and its corresponding text-color tokens. Heading/body fonts and 12px card corners use existing tokens. No new hover effects, accordion controls, or botanical artwork are included.

## Component interfaces

Import from `client/src/components/modular/sections`:

```jsx
import {
  HeaderCardsSection,
  HeaderStackSection,
  TimelineSection
} from '../components/modular/sections'

const items = [
  {
    id: 'assessment',
    title: 'Assessment',
    description: 'Our team learns about your needs and goals.',
    iconName: 'ClipboardCheck'
  },
  {
    id: 'care-plan',
    title: 'Care Plan',
    description: 'We create a plan with you and your family.',
    iconName: 'HeartHandshake'
  }
]

<HeaderCardsSection
  title='Care at home'
  subtitle='Support for patients and families.'
  label='Our care'
  items={items}
  headerPosition='left'
  backgroundImageUrl='/images/care.jpg'
/>

<HeaderStackSection title='Understanding care' items={items} columns={2} />
<TimelineSection title='Our Care Process' items={items} />
```

The consuming app must load `global.css`; each component imports its own shared layout stylesheet.

| Input | Supported by | Behavior / default |
| --- | --- | --- |
| `title` | All | Section heading; omitted when empty. Uses a unique generated ID to label its section. |
| `subtitle` | All | Optional text below the heading. |
| `label` | All | Optional small uppercase label above the heading, with an accent line. Omitted by default. |
| `items` | All | Ordered array of `{ id, title, description, iconName? }`. Defaults to `[]`; supply stable unique IDs. Copy is rendered as text, with newlines preserved. |
| `headerPosition` | Header/Cards | `'left'` by default, or `'right'`; header remains first in reading order and above the cards on smaller screens. |
| `backgroundImageUrl` | Header/Cards | Optional decorative section-wide image. A theme-colored fade backs the header. Missing or failed images use the normal theme background. |
| `columns` | Header/Stack | Numeric `1` by default, or `2`; an odd final card retains one-column width. |

Card titles are optional in Header/Cards to support the reference's icon-and-description design. Icons are decorative. Supported names: `Activity`, `ClipboardCheck`, `Coins`, `FileCheck`, `Heart`, `HeartHandshake`, `House`, `Home` (alias), `ShieldCheck`, `Stethoscope`, `TrendingUp`, and `Users`. Missing or unsupported names use `Heart`. Header/Stack and Timeline do not use `iconName`.

Both Header/Cards and Timeline use ordered lists; visible numbers follow array order and are hidden from assistive technologies to avoid repeating list numbering. Stack cards are articles whose content is always visible.

## Responsive behavior

| Width | Header/Cards | Header/Stack | Timeline |
| --- | --- | --- | --- |
| 1024px and above | Split header and three card columns | One or two columns | Horizontal for up to five steps; vertical for six or more |
| 768–1023px | Header above two card columns | One or two columns | Vertical |
| Below 768px | Header above one card column | One column | Vertical |

A single timeline step has no connector; empty items leave only the optional section heading. Long text wraps within its column. Cards and steps have no click/hover affordances. Header/Cards has an image fade that reverses with the header position and changes to a top-to-bottom fade on smaller screens. Alternating icon badges use light green/light gray with text colors that remain readable in the existing dark theme.

## Future content-manager adapter

These components perform no content fetching or persistence. Resolve existing content before passing it in:

- For the local editor records, map `section.content.header` / `section.title` to `title`, and `section.content.text` to `subtitle`. Resolve `section.content.cardIds` through `CardStorageService` in their saved order, dropping missing records. Map each card's `id`, `content.header`, `content.text`, and `content.iconName` to the item fields.
- For database-backed cards, resolve translations with the existing `pickText` helper first. Map card `header` / `paragraph` to item `title` / `description`; do not pass translation objects directly. Database symbols currently are not Lucide names and would need an explicit mapping.
- Keep layout-specific configuration in the adapter: header position and decorative background for Header/Cards, numeric columns for Header/Stack. Timeline numbering comes from item order rather than card symbols.
- Keep draft values and validation in the eventual editor integration. No storage migration or renderer integration is included in this story increment.

## Isolated development preview

Start the client with `npm run dev`, then open **`/section-layouts-preview.html`** on the displayed Vite address. The separate HTML entry does not add a production app route or modify existing pages. Preview copy is illustrative.

Controls cover left/right header placement, image on/off, stack columns, empty/single/five/six timeline steps, and dark theme. An existing portal card appears below the samples to check style isolation. The preview imports existing card, Hospice, and responsive CSS to reveal interactions with the site's selectors.

## Files added or updated

- `client/src/components/modular/sections/HeaderCardsSection.jsx`
- `client/src/components/modular/sections/HeaderStackSection.jsx`
- `client/src/components/modular/sections/TimelineSection.jsx`
- `client/src/components/modular/sections/SectionHeading.jsx`
- `client/src/components/modular/sections/SectionIcon.jsx`
- `client/src/components/modular/sections/index.js`
- `client/src/components/modular/sections/__tests__/SectionLayouts.test.jsx`
- `client/src/styles/section-layouts.css`
- `client/section-layouts-preview.html`
- `client/src/previews/SectionLayoutsPreview.jsx`
- `client/src/previews/section-layouts-preview.css`
- `docs/sprint8/DT-743-card-sections-css.md`
- `docs/sprint8/DT-743-reusable-section-layouts.md`

## Validation

- Component tests: 15 passed. Covers accessible section labels, optional/empty content, long copy, text escaping, both header positions, decorative and failed background images, icon fallback, both stack configurations, odd counts, and timeline ordering/numbering.
- Site production build: passed. Separate preview production bundle also passed, ensuring the new components compile even though live pages do not import them yet. Builds report existing dependency directive warnings; the site build also reports its existing bundle-size warning.
- Headless Chrome: inspected screenshots at 1536px, 834px, and 390px; measured layout at 1536px, 1024px, 834px, 390px, and 320px. Verified responsive columns and connector orientation, 12px corners, reversed header, two-column stack, six-step timeline, and dark-theme rendering. No horizontal overflow was observed.
- JavaScript Standard Style check for the new components, tests, and preview: passed.
- Browser style-isolation comparison: existing portal card colors, border, radius, padding, font size, width, and transform were unchanged with the new stylesheet enabled/disabled in a fixed-width container. A single timeline step had no generated connector.
- `git diff --check`: passed.
