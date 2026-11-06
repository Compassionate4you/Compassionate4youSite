# DT-902: Modular section styles and header text banners

Sprint: **09**

## Changes

Split the section layout stylesheet into Banner, Header Cards, Header Stack, Timeline, and shared foundation styles. Existing layout selectors, theme tokens, and responsive behavior are preserved. Each layout component imports its shared foundation followed by its own rules; the preview imports banner styles directly.

All HEADER_TEXT sections now use the complete DT-861 banner: pale rounded panels, circular decorative icons between sage divider lines, centered serif headings, and body copy. The shared BannerSection component is used by HeaderTextSection, the preview, and paragraph cards within the three recognized Welcome sections. Philosophy uses Heart, Caring uses HeartHandshake, and About uses Users; other HEADER_TEXT sections default to Heart. Icons are selected using stable IDs/slugs, not heading text.

Headings have unique accessible labels; decorative icons are hidden from assistive technologies. Content is localized, typography overrides and passed styles are retained, and card paragraphs/lists retain their formatting. Recognized Welcome paragraph sections use full-width single-column banners with responsive outside padding; unrelated text and image layouts keep their existing presentation. The earlier panel/text-only choice was superseded by the supplied reference image.

Removed the preview's stale import of the deleted HospicePage.css so it can build.

Removed the superseded HeaderTextSection.css and section-layouts.css. No database changes or reseeding. Internal presentation interfaces add BannerSection props and an optional BannerIcon prop to ModularCard; existing callers remain compatible.

## Files modified

- client/src/styles/components/modular/sections/{BannerSection,HeaderCardsSection,HeaderStackSection,TimelineSection,SectionShared}.css (created)
- client/src/styles/components/modular/sections/HeaderTextSection.css (deleted)
- client/src/styles/section-layouts.css (deleted)
- client/src/components/modular/sections/{BannerSection,HeaderTextSection,CardSection,HeaderCardsSection,HeaderStackSection,TimelineSection}.jsx
- client/src/components/modular/cards/ModularCard.jsx
- client/src/components/modular/sections/__tests__/BannerSection.test.jsx
- client/src/previews/SectionLayoutsPreview.jsx
- docs/sprint09/DT-902-section-layout-styles.md

## Validation

- Site production build and separate preview-entry production build passed. Existing dependency directive, dynamic import, and bundle-size warnings remain.
- All 25 tests passed: 15 existing SectionLayouts tests and 10 banner tests covering both render paths, stable icon selection, translated content, paragraph/list formatting, unique heading labels, decorative accessibility, typography overrides, and unrelated layouts.
- Targeted JavaScript Standard Style checks passed for the updated components, preview, and banner tests.
- Initial extraction was checked against the original CSS with PostCSS: selectors, declarations, and media conditions were preserved. Banner-specific formatted-text and full-width card-container rules were subsequently added.
- No imports of the removed stylesheets remain; git diff --check passed.
- WelcomeTranslations suite could not run because its existing ../../CardSection import does not resolve; left this unrelated test unchanged.
- Headless Chrome initially exited with code 134 inside the sandbox; running with an approved temporary profile outside the sandbox succeeded. Inspected a desktop preview screenshot and verified three full banners at 320px, 390px, 834px, and 1536px in light and dark themes: no page/panel horizontal overflow, all badges present, and theme-specific panel surfaces. Browser checks used the shared component in the standalone preview; card-path behavior is covered by rendering tests.

## Sprint 08 reference-content restoration

The supplied `Home_Health.html`, `Hospice.html`, and `Welcome.html` are the English authority for main-page content. Existing matching translation keys now supply the rendered copy, rather than the replacement copy in CMS seed records. CMS data, shared navigation/footer, chatbot, and accessibility controls are unchanged. Existing language fallback remains active; no new translations were invented.

| Page | Restored content and retained presentation |
| --- | --- |
| Home Health | Original hero and scheduling action; eight services; seven advantages; ten specialties; original closing description and scheduling/home actions. All three content sections remain HeaderCards, with the advantages heading on the right. |
| Hospice | Original hero/action; five Understanding cards in HeaderStack; six Team & Benefits cards in HeaderCards; a separate six-card Comprehensive Support Services HeaderCards section; Above and Beyond introduction and seven HeaderStack items; five original Care Process timeline steps with descriptions; closing copy and scheduling/home actions. |
| Welcome | Original hero, Philosophy/Caring/About banners, two informational image cards with paragraph breaks, contact details/form, map address/directions, and five FAQ questions and answers. |

The earlier Hospice benefits/support-services merge is superseded: each section now renders independently using its own reference content. Original headings such as `Above and Beyond Care` and `Our Care Process` are restored. Duplicate Services headings, decorative number badges in source markup, and redundant ContentPage headings are not copied. Banner headings retain their current accessible section-heading level.

HeaderCards items accept optional `listItems: string[]`, rendered as a semantic list after the description. Benefit appliances/supplies/medication and social-worker support lists retain their wording, with source bullet prefixes removed from text. MapSection accepts `content.hideHeading` and `content.directionsText` so Welcome can match its reference map while preserving existing defaults elsewhere. Closing actions share PageCallToAction and working `/schedule` and `/` links. Welcome image cards import bundled image assets, avoiding unresolved `/images/` paths.

### Additional files modified

- `client/src/components/modular/{WelcomeSections,HomeHealthSections,HospiceSections}.jsx`: reference-content adapters.
- `client/src/pages/ContentPage.jsx`: select Welcome adapter and avoid duplicate hero headings.
- `client/src/components/modular/sections/{HeaderCardsSection,MapSection,PageCallToAction}.jsx`: semantic lists, map options, and closing actions.
- `client/src/components/modular/sections/__tests__/{ReferenceContent,HomeHealthSections,HospiceSections}.test.jsx`: reference copy/order, lists, translation changes, and retained layouts.
- `client/src/components/modular/sections/__tests__/fixtures/sprint08-content.json`: portable source-content snapshot extracted from the supplied HTML main regions.
- `client/src/pages/__tests__/ContentPageLayouts.test.jsx`: Welcome, Home Health aliases, Hospice, and unrelated-page dispatch.

### Restoration validation

- Six focused files passed, 52 tests: reference-content comparison, Home Health, Hospice, shared layouts, ContentPage dispatch, and existing contact-form regression tests.
- Reference tests check every captured heading, paragraph, list item, and action in source reading order, including seven Above and Beyond labels. The intentional duplicate Services heading is ignored. New card-title headings and promoted banner headings preserve current layouts.
- Tests verify a single hero heading per adapter, restored card counts, semantic benefit lists, scheduling/home/directions destinations, Welcome contact-form API submission, and English/Spanish content changes. The Home Health suite also exercises all seven existing locales and their established English fallback.
- Production build passed with existing module-directive, dynamic-import, and bundle-size warnings. Targeted Standard checks passed after formatting the two hero JSX branches.
- Browser visual checks were not performed for this restoration. Earlier preview-only checks above do not validate these updated pages.
- `CardSection.css` remains for other consumers; this restoration does not delete it or copy its styles into new layouts.

## Screenshot hero layouts and image loading repair

Replaced the three page-adapter heroes with reusable HeroSection and its own scoped HeroSection.css. BannerSection and its stylesheet remain unchanged.

- Welcome uses the pale-green split layout, left-aligned serif title and description, curved right-hand photo, and labeled seven-language selector. The photo is the existing bundled CareImage1.jpeg. Mobile places the photo below the copy and selector.
- Home Health uses the existing CareImage1.jpeg as a full-width background with a muted teal overlay, left-hand title/description, decorative house badge, and scheduling action.
- Hospice uses the existing older_couple_smiling.jpeg as a background with a green overlay, right-hand white copy, decorative heart badge, and contact action. Mobile uses full-width copy.
- Copy remains sourced from the existing translations. The selector changes the shared i18n instance, so it stays synchronized with the accessibility panel and existing document language/direction handling.
- HeroSection accepts `variant` (split/background), `contentPosition` (left/right), `tone` (teal/forest), title/description, optional imageUrl/imageAlt, optional House/Heart iconName, buttonText/buttonLink, and showLanguageSelector. It is exported from the shared sections index.
- Images are optional; failed images are removed while the solid-color hero and readable content remain. Background photos and icons are decorative; the Welcome photo has alternative text. Focus styles and responsive wrapping keep controls and copy usable.
- Split layout uses a minimum height rather than a fixed height so increased text can grow the hero without clipping.

### Image failure cause and repair

Previous CMS image strings referenced `/assets/images/CareImage1.jpeg` and `/images/...`, but the files reside in src/assets/images rather than a public directory. These strings bypassed Vite's asset pipeline and pointed at nonexistent served paths.

The shared resolveImageUrl helper imports the three existing photos and translates only their recognized legacy paths into Vite-generated URLs. Custom upload paths and remote URLs are preserved. ImageCard, ImageHeaderTextSection, and the existing FullscreenImageHeaderSection use this resolver; the new page heroes receive local imports. No downloads, database updates, or reseeding are required.

### Hero files modified

- `client/src/components/modular/sections/HeroSection.jsx` and `client/src/styles/components/modular/sections/HeroSection.css`: new layouts and language selector.
- `client/src/components/modular/resolveImageUrl.js`: legacy-path asset resolver.
- `client/src/components/modular/{WelcomeSections,HomeHealthSections,HospiceSections}.jsx`: new hero configuration and local photos.
- `client/src/components/modular/cards/ImageCard.jsx` and `client/src/components/modular/sections/{FullscreenImageHeaderSection,ImageHeaderTextSection}.jsx`: repair legacy photo paths for existing callers.
- `client/src/components/modular/sections/index.js`: HeroSection export.
- `client/src/components/modular/sections/__tests__/HeroSection.test.jsx`: positioning, icons, actions, language synchronization, image resolution, optional/failed photos, and replacement-photo coverage.

### Hero validation

- Seven focused test files passed, 57 tests total: HeroSection, reference content, Home Health, Hospice, shared layouts, ContentPage dispatch, and contact-form regression tests.
- Targeted JavaScript Standard checks passed for the new component, resolver, adapters, export, and hero tests.
- Production build passed and emitted CareImage1, older_couple_smiling, and working_a_puzzle_together as hashed assets. Existing dependency directive, dynamic-import, and bundle-size warnings remain.
- Inspected isolated previews rendering the real three page adapters in local headless Chrome. CDP viewport checks at 320, 390, 834, and 1440px confirmed every photo loaded, text/control widths fit, and there was no horizontal overflow. Inspected desktop and true-390px screenshots of the split/photo layouts.
- Repeated browser measurements with a 32px root font at 390, 834, and 1440px: no clipped content, horizontal overflow, or failed images. These are isolated hero checks, not a full CMS-backed-page browser audit.
- Initial Chrome screenshot flags clamped narrow layout widths to 500px; those captures were superseded by real CDP viewport measurements. Temporary preview files and the preview server were removed/stopped after validation.

## Welcome-only screenshot refinement

Welcome now uses a dedicated WelcomeHeroSection wrapper and WelcomeHeroSection.css. The wrapper retains HeroSection's working language selector, local-photo resolution, alternative text, and failed-image behavior. HeroSection adds an optional className prop for scoped presentation; its background hero styling is unchanged.

- Desktop geometry follows the supplied screenshot: approximately 54% copy / 46% photo and a minimum height of 8/19 of viewport width. This replaces the previous 80vh Welcome sizing and allows translated/enlarged content to grow beyond the reference height.
- Pale-green surface, two-line serif heading, compact paragraph, responsive side/top padding, photo cropping and curved corners, and lower-left language control are styled only beneath `.c4-welcome-hero`.
- Mobile retains text and language selection above the photo. No content, photo, language options, or CMS data changed.
- BannerSection, HeaderCardsSection, Home Health, and Hospice styles were preserved.

### Refinement files and validation

- Added `client/src/components/modular/sections/WelcomeHeroSection.jsx` and `client/src/styles/components/modular/sections/WelcomeHeroSection.css`.
- Updated WelcomeSections to use the wrapper, HeroSection to accept className, the section index to export the wrapper, and existing HeroSection/ReferenceContent tests to check class forwarding and the Welcome-specific scope.
- Six focused test files passed, 32 tests total; targeted Standard checks and the production build passed. Existing build dependency and chunk-size warnings remain.
- Chrome checks at 320, 390, 834, and 1440px confirmed loaded photos, fitting text/controls, and no horizontal overflow. Increased-root-font checks at 390, 834, and 1440px found no clipping or overflow.
- Inspected Welcome at 1440px against the supplied screenshot at equivalent scale: the hero is about 606px tall, the photo starts at 54% width, the title wraps into the reference two lines, and the language control sits in the lower-left portion.
- Home Health and Hospice screenshots at 390 and 1440px were byte-for-byte identical to the preceding captures. Browser checks used the temporary isolated preview of the real page adapters; it was removed and both local preview processes stopped after verification.

## Welcome route integration correction

The application's root redirects to `/welcome`, but ContentPage previously selected WelcomeSections only for the page ID `landing`. A CMS record renamed to `welcome` therefore rendered through the generic image/text layout, producing the old copy, scheduling button, extra Home heading, and broken image instead of the dedicated hero. Prior isolated component previews did not exercise this route mismatch.

- ContentPage now normalizes `welcome`, `landing`, and `home` to the Welcome presentation. It prefers the exact requested CMS record, then falls back in canonical order to landing/welcome/home records. Home Health alias handling and unrelated pages remain intact.
- WelcomeSections recognizes both seeded `sec-landing-hero` and initial-cache `sec-hero` identifiers. Both render the reference title, description, local photo, and language selector without the generic scheduling action.
- The adapter suppresses the redundant Home heading. No further hero CSS changes or CMS data migrations were necessary.

Files modified: `client/src/pages/ContentPage.jsx`, `client/src/components/modular/WelcomeSections.jsx`, `client/src/pages/__tests__/ContentPageLayouts.test.jsx`, and new `client/src/pages/__tests__/ContentPageWelcome.test.jsx`.

Validation: seven focused test files passed, 41 tests total. New integration tests mount the real ContentPage and Welcome adapter for all three aliases with landing-only and renamed-welcome records, both known hero identifiers, exact-record precedence, one H1, the bundled photo, language control, and absence of the old CTA. Targeted Standard checks and the production build passed; existing dependency/chunk warnings remain.

Full-application Chrome checks used the normal app entry, router, navigation, global stylesheet imports, and temporary intercepted read-only CMS responses containing a `welcome` record and seeded section IDs. At 1440 and 390px, `/`, `/welcome`, `/landing`, and `/home` all displayed the intended hero with one H1, a loaded photo, no hero scheduling action, and no horizontal overflow. `/` correctly redirected to `/welcome`. Changing the hero selector to Spanish updated the title, accessibility-panel selector, and document language together. Desktop/mobile full-route screenshots were inspected against the supplied target. The backend database was untouched, and the temporary Vite/Chrome processes were stopped afterward.

## Public-page dark mode, complete translations, and Welcome naming

ContentPage now reads the active AccessibilityContext theme instead of passing `light` to every renderer. Public adapters and generic sections receive the active value. Known-page browser titles follow the active language.

ContentPageTheme.css supplies light/dark surface, raised surface, input, text, heading, border, muted, accent, and feedback tokens scoped to the three public page adapters. ContactFormSection, MapSection, and FAQSection use those tokens as fallbacks while preserving explicit CMS color overrides. Inputs, placeholders, focus rings, validation errors, success/failure messages, addresses, directions, expanded FAQ answers, and icons remain readable. The audit also corrected pale HeaderCards surfaces with white text, HeaderStack title strips, and the default informational ImageCard surfaces in dark mode. Approved hero designs and photos remain unchanged. The embedded map provider controls the map imagery; its surrounding interface follows the site theme.

Added missing Home Health and FAQ content for Hindi, Punjabi, and Urdu, plus missing contact-form validation and status messages for Urdu, Mandarin, and Vietnamese. Existing English strings incorrectly stored in Urdu Hospice/service fields were translated, including list items, descriptions, support services, and care-process steps. Existing equivalent localized Hospice paragraphs supply the newly completed FAQ answers. All seven supported locales now contain the full shape of the public landing/homeHealth/homeHealthPage/hospice/faq/locations/accessibility/nav/footer namespaces. This supersedes the earlier English-fallback limitation documented for DT-731 and the earlier restoration.

The known Home page is displayed as Welcome throughout navigation, browser titles, footer links, and return actions, using localized labels. Known Home Health/Hospice navigation labels are translated instead of exposing the English CMS title. Custom CMS page titles are preserved. Legacy Welcome alias records collapse into one navigation link, with `/welcome` as the destination and active-link support for `/`, `/home`, and `/landing`. Existing URLs and CMS IDs/data are unchanged.

The Urdu audit found that the closed accessibility panel's direction-change transition briefly crossed the visible page. An aria-hidden panel is now visually hidden and ignores pointer events, while the normal open-panel behavior remains intact.

### Additional files modified

- `client/src/pages/ContentPage.jsx`: active-theme forwarding, scoped public-page theme class, and localized browser title.
- `client/src/services/contentPageLabels.js`: known-page labels and Welcome alias recognition.
- `client/src/components/layout/{Navbar,Footer}.jsx` and `client/src/components/modular/sections/PageCallToAction.jsx`: translated naming, alias deduplication, and canonical Welcome links.
- `client/src/components/modular/WelcomeSections.jsx`: localized map iframe title.
- `client/src/styles/ContentPageTheme.css`, `client/src/styles/components/modular/sections/{ContactFormSection,MapSection,FAQSection}.css`, and `client/src/styles/components/modular/cards/ImageCard.css`: public theme tokens and surface/text fallbacks.
- `client/src/components/accessibility/styles/accessibility.css`: prevent hidden-panel flashes during language-direction changes.
- `client/src/locales/{en,es,pa,ur,zh,vi,hi}/translation.json`: complete public copy, navigation controls, and Welcome return labels. JSON files retain valid JSON syntax; story attribution is recorded here because JSON has no comment syntax.
- `client/src/components/modular/sections/__tests__/PublicPageTranslations.test.jsx`: every-locale key/array coverage, copied-English regression checks, and translated known-page labels.
- Existing ContentPageLayouts, ContentPageWelcome, and ReferenceContent tests: dark-theme forwarding, Welcome browser title, and the explicitly renamed return action. The original HTML content fixture remains unchanged.

### Validation

- Nine focused test files passed, 73 tests total: translation coverage, both ContentPage suites, reference content, Home Health, Hospice, HeroSection, shared layouts, and contact-form regression tests.
- Targeted Standard checks passed for the new label helper, modified public adapters/action, translation/reference tests, and ContentPage tests. Navbar retains its existing JSX quote/format conventions rather than applying unrelated whole-file formatting changes.
- Production build passed with the existing dependency directive, dynamic-import, and bundle-size warnings. `git diff --check` passed.
- Full-application Chrome checks with temporary read-only CMS fixtures covered 84 combinations: three pages × seven languages × two themes × desktop/mobile widths (1440/390px). All language changes updated the document language, no public-page horizontal overflow occurred, all local page images loaded, and the desktop navbar contained one Welcome link even with duplicate alias records.
- Dark Contact, Map, and FAQ computed backgrounds were rgb(31,36,34), with rgb(240,242,238) contact/FAQ text. Dark inputs used rgb(32,39,35), with readable rgb(180,189,183) placeholders. Light surfaces retained white backgrounds and dark text. FAQ expansion and input focus were exercised in both modes.
- Inspected dark contact-form and Urdu mobile screenshots after correcting the closed-panel visibility issue. The hero language control, accessibility selector, document direction, page content, and translated browser titles responded together. Native map tiles retain provider styling.
- Browser fixtures were intercepted only in a temporary Chrome profile. No backend writes, migrations, or reseeding were performed; the temporary Vite and Chrome sessions were stopped after verification.
