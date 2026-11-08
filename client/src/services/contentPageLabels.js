// DT-902: Translate known public pages while preserving custom CMS titles.
export function getContentPageLabel (page, t) {
  if (isWelcomePage(page.id)) return t('nav.welcome')
  if (['homeHealth', 'home-health'].includes(page.id)) return t('nav.homeHealth')
  if (page.id === 'hospice') return t('hospice.blurb.title')
  return page.content?.title || page.id
}

// DT-902: Give all Welcome aliases one user-facing label and destination.
export function isWelcomePage (id) {
  return ['landing', 'welcome', 'home'].includes(id)
}
