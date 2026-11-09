// DT-893 Sprint 9
// Gandhar Tare
// One place that turns the content editor's formatting settings (text
// align, bold, italic, font) into styles, so every page and section treats
// them the same way.
//
// Stored shape (content.typography.header / .text / .paragraph):
//   align:      'left' | 'center' | 'right' | 'justify'   (missing = keep the page's own)
//   bold:       true                                       (bold)
//   weight:     'normal'                                   (force not bold, e.g. a heading)
//   italic:     true
//   fontFamily: CSS font list, or 'inherit' for the page's own font

const ALIGNMENTS = ['left', 'center', 'right', 'justify']

// DT-893: before this fix the editor saved this exact object whenever a
// section was saved without touching the formatting bar, because "left" was
// shown as selected by default. It means "nothing chosen", not "force left".
export function isUntouchedDefault (t) {
  return Boolean(t) &&
    t.align === 'left' &&
    !t.bold &&
    !t.italic &&
    (!t.fontFamily || t.fontFamily === 'inherit') &&
    !t.weight
}

// DT-893: only the settings the admin actually chose, or null for none.
export function normalizeTypography (t) {
  if (!t || typeof t !== 'object' || isUntouchedDefault(t)) return null
  const out = {}
  if (ALIGNMENTS.includes(t.align)) out.align = t.align
  if (t.bold === true) out.weight = 'bold'
  else if (t.weight === 'normal') out.weight = 'normal'
  if (t.italic === true) out.italic = true
  if (t.fontFamily && t.fontFamily !== 'inherit') out.fontFamily = t.fontFamily
  return Object.keys(out).length > 0 ? out : null
}

// DT-893: inline style for one piece of text. Settings that were not chosen
// are left out, so the page's own styling (e.g. centered or bold headings)
// stays as it is.
export function typographyStyle (t) {
  const n = normalizeTypography(t)
  if (!n) return {}
  return {
    ...(n.align ? { textAlign: n.align } : {}),
    ...(n.fontFamily ? { fontFamily: n.fontFamily } : {}),
    ...(n.weight ? { fontWeight: n.weight === 'bold' ? 'bold' : 'normal' } : {}),
    ...(n.italic ? { fontStyle: 'italic' } : {})
  }
}

// DT-893: CSS variables and data attributes for TypographyScope, which
// applies a section's header/text formatting to its title and description.
// Returns null when nothing was chosen.
export function typographyScopeProps (typography) {
  const parts = {
    heading: normalizeTypography(typography?.header),
    text: normalizeTypography(typography?.text || typography?.paragraph)
  }
  const style = {}
  const data = {}
  for (const [part, n] of Object.entries(parts)) {
    if (!n) continue
    if (n.align) { style[`--c4-${part}-align`] = n.align; data[`data-${part}-align`] = '' }
    if (n.fontFamily) { style[`--c4-${part}-font`] = n.fontFamily; data[`data-${part}-font`] = '' }
    if (n.weight) { style[`--c4-${part}-weight`] = n.weight === 'bold' ? '700' : '400'; data[`data-${part}-weight`] = '' }
    if (n.italic) { style[`--c4-${part}-style`] = 'italic'; data[`data-${part}-style`] = '' }
  }
  return Object.keys(data).length > 0 ? { style, data } : null
}
