const imageCardKeys = {
  '/images/working_a_puzzle_together.jpeg': 'landing.infoCards.card1',
  '/images/older_couple_smiling.jpeg': 'landing.infoCards.card2',
};

const textCardKeys = {
  'welcome-philosophy': { header: 'landing.philosophyTitle', paragraph: 'landing.philosophyText' },
  'welcome-caring-since': { header: 'landing.caringSinceTitle', paragraph: 'landing.caringSinceText' },
  'welcome-about': { header: 'landing.aboutTitle', paragraph: 'landing.aboutText' },
};

// Older database seeds lack some welcome translations. Use local copy only
// when the saved English still matches that copy; keep custom content intact.
export function withWelcomeTranslations(card, slug, i18n) {
  const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  if (language === 'en') return card;

  let keys;
  if (slug === 'welcome-info' && card.layoutType === 'IMAGE_FULL_WIDTH') {
    const base = imageCardKeys[card.imageUrl];
    if (base) keys = Object.fromEntries(['header', 'paragraph', 'imageAlt'].map(field => [field, `${base}.${field}`]));
  } else if (card.position === 0 && card.layoutType === 'HEADER_PARAGRAPH') {
    keys = textCardKeys[slug];
  }
  if (!keys) return card;

  const result = { ...card };
  for (const [field, key] of Object.entries(keys)) {
    const saved = card[field];
    const english = typeof saved === 'string' ? saved : saved?.en;
    const translated = typeof saved === 'object' && saved !== null ? saved[language] : undefined;
    const source = i18n.getResource('en', 'translation', key);
    const fallback = i18n.getResource(language, 'translation', key);
    if (english !== source || (translated?.trim() && translated !== english)) continue;
    if (typeof fallback !== 'string' || !fallback.trim() || fallback.startsWith('[UNTRANSLATED')) continue;
    result[field] = { ...(typeof saved === 'object' && saved !== null ? saved : { en: english }), [language]: fallback };
  }
  return result;
}
