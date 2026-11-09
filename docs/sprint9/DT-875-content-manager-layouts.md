# DT-875: Update Content Manager for All Section and Card Layouts

- **Sprint**: Sprint 9
- **Story ID**: DT-875

## Summary

Updated `SectionManager`, `CardManager`, `DynamicSectionRenderer`, and `ModularCard` so that all newly introduced and updated modular section and card layouts are selectable in the Content Editor with all of their editable fields present in dedicated per-layout React components.

## Section Layouts Supported in `SectionManager`

1. **`HEADER_TEXT` (`HeaderTextLayout.jsx` -> `HeaderTextSection.jsx` / `BannerSection.jsx`)**:
   - Title / Header + Header Typography & Alignment
   - Body Text / Description + Body Text Typography & Alignment
   - Banner Badge Icon (`Auto`, `Heart`, `HeartHandshake`, `Users`)
   - Multi-paragraph & `- ` bullet list formatting toggle (`formatBody`)
2. **`HERO_SECTION` (`HeroSectionLayout.jsx` -> `HeroSection.jsx` / `WelcomeHeroSection.jsx`)**:
   - Hero Title & Hero Description / Subtitle
   - Hero Variant (`split`, `background`, `welcome`)
   - Content Position (`left`, `right`)
   - Surface Tone (`teal`, `forest`)
   - Heading Badge Icon (`None`, `House`, `Heart`)
   - Hero Image URL & Image Alt Text
   - CTA Button Text & CTA Button Link
   - Show Image Overlay Tint toggle (`showOverlay`) & Show Language Selector toggle (`showLanguageSelector`)
3. **`HEADER_CARDS` (`HeaderCardsLayout.jsx` -> `HeaderCardsSection.jsx`)**:
   - Eyebrow Label (`label`), Section Title (`header`), Subtitle / Introductory Text (`text`)
   - Header Placement (`left`, `right`)
   - Section Surface (`default`, `white`, `gray`)
   - Decorative Background Image URL (`imageUrl`)
   - Assigned Cards & Numbering Order (`cardIds`)
4. **`HEADER_STACK` (`HeaderStackLayout.jsx` -> `HeaderStackSection.jsx`)**:
   - Eyebrow Label (`label`), Section Title (`header`), Subtitle (`text`)
   - Stack Columns (`1` or `2`)
   - Assigned Cards (`cardIds`) and Inline Stack Items (`items`: `{ heading, description }[]` with add, reorder, remove)
5. **`TIMELINE_SECTION` (`TimelineSectionLayout.jsx` -> `TimelineSection.jsx`)**:
   - Eyebrow Label (`label`), Timeline Title (`header`), Subtitle (`text`)
   - Assigned Step Cards (`cardIds`) and Inline Timeline Steps (`items`: `{ heading, description }[]` with add, reorder, remove)
6. **`PAGE_CTA` (`PageCallToActionLayout.jsx` -> `PageCallToAction.jsx`)**:
   - Call-To-Action Title (`header`) & Description (`text`)
   - Primary Action Label (`buttonText`, links to `/schedule`) & Home Action Label (`secondaryButtonText`, links to `/welcome`)
7. **`IMAGE_HEADER_TEXT` (`ImageHeaderTextLayout.jsx` -> `ImageHeaderTextSection.jsx`)**:
   - Title + Typography, Body Text + Typography, Visual Left/Right Image Position Toggle, Image URL, Image Alt, Button Text, Button Link
8. **`FULLSCREEN_IMAGE_HEADER` (`FullscreenImageHeaderLayout.jsx` -> `FullscreenImageHeaderSection.jsx`)**:
   - Title + Typography, Body Text + Typography, Image URL, Image Alt, Button Text, Button Link, Banner Icon / Emoji (`icon`)
9. **`CARD_GRID` (`CardGridLayout.jsx` -> `CardSection.jsx`)**:
   - Title + Typography, Grid Columns (`1`–`5`), Section Cards & Display Order (`cardIds`)
10. **`MAP_SECTION` (`MapSectionLayout.jsx` -> `MapSection.jsx`)**:
    - Title + Typography, Hide Heading on Page toggle (`hideHeading`), Office Address Text (`mapAddress`), Google Maps Embed URL (`embedUrl`), Directions URL (`directionsUrl`), Directions Button Text (`directionsText`)
11. **`ACCOUNT_BENEFITS` (`AccountBenefitsLayout.jsx` -> `AccountBenefitsSection.jsx`)**:
    - Title + Typography, Benefit Items (`{ heading, description }[]` with add, reorder, remove)
12. **`CONTACT_FORM` (`ContactFormLayout.jsx` -> `ContactFormSection.jsx`)**:
    - Title + Typography, Phone Number (`phone`), Email Address (`email`), Fax Number (`fax`), Address Line 1 (`addressLine1`), Address Line 2 (`addressLine2`)
13. **`FAQ_SECTION` (`FaqSectionLayout.jsx` -> `FAQSection.jsx`)**:
    - Title + Typography, FAQ Items (`{ question, answer }[]` with add, reorder, remove)

## Card Layouts Supported in `CardManager`

1. **`HEADER_PARAGRAPH` (`HeaderParagraphLayout.jsx` -> `HeaderParagraphCard.jsx`)**:
   - Card Header + Typography, Paragraph Body (with `- ` bullet list support) + Typography, Alignment (`left`, `center`, `right`)
2. **`IMAGE_FULL_WIDTH` (`ImageFullWidthLayout.jsx` -> `ImageCard.jsx`)**:
   - Card Header + Typography, Paragraph Body + Typography, Image URL, Image Alt, Image Alignment (`left`, `right`)
3. **`PHOTO_TEXT_CARD` (`PhotoTextCardLayout.jsx` -> `PhotoTextCard.jsx`)**:
   - Card Header, Paragraph Body, Visual Left/Right Photo Placement Toggle (`imagePosition`), Photo URL, Photo Alt Text
4. **`HEADER_SYMBOL` (`HeaderSymbolLayout.jsx` -> `HeaderSymbolCard.jsx`)**:
   - Card Header + Typography, Optional Description / Body Text + Typography, Expanded 38-Icon Symbol Selector (`SYMBOL_OPTIONS`), Alignment (`left`, `center`, `right`)

## Files Added

- `client/src/components/admin/content/SectionManager/HeroSectionLayout.jsx`
- `client/src/components/admin/content/SectionManager/HeaderCardsLayout.jsx`
- `client/src/components/admin/content/SectionManager/HeaderStackLayout.jsx`
- `client/src/components/admin/content/SectionManager/TimelineSectionLayout.jsx`
- `client/src/components/admin/content/SectionManager/PageCallToActionLayout.jsx`
- `client/src/components/admin/content/CardManager/PhotoTextCardLayout.jsx`
- `docs/sprint9/DT-875-content-manager-layouts.md`

## Files Modified

- `client/src/components/admin/content/SectionManager.jsx`
- `client/src/components/admin/content/SectionManager/HeaderTextLayout.jsx`
- `client/src/components/admin/content/SectionManager/FullscreenImageHeaderLayout.jsx`
- `client/src/components/admin/content/SectionManager/CardGridLayout.jsx`
- `client/src/components/admin/content/SectionManager/MapSectionLayout.jsx`
- `client/src/components/admin/content/SectionManager/AccountBenefitsLayout.jsx`
- `client/src/components/admin/content/SectionManager/ContactFormLayout.jsx`
- `client/src/components/admin/content/CardManager.jsx`
- `client/src/components/admin/content/CardManager/HeaderSymbolLayout.jsx`
- `client/src/components/modular/DynamicSectionRenderer.jsx`
- `client/src/components/modular/sections/HeaderTextSection.jsx`
- `client/src/components/modular/cards/ModularCard.jsx`
- `client/src/components/modular/cards/HeaderSymbolCard.jsx`
