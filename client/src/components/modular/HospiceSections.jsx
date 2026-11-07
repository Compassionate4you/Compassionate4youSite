import { useTranslation } from 'react-i18next'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import HeaderCardsSection from './sections/HeaderCardsSection'
import HeaderStackSection from './sections/HeaderStackSection'
import TimelineSection from './sections/TimelineSection'
import HeroSection from './sections/HeroSection'
// DT-902: Use compassion_image3 for the Hospice Care hero.
import compassionImage from '../../assets/images/compassion_image3.jpeg'
import PageCallToAction from './sections/PageCallToAction'

// DT-902: Keep card icons aligned with the established translated card order.
const BENEFIT_ICONS = ['HeartHandshake', 'Clock', 'BriefcaseMedical', 'Stethoscope', 'Cross', 'Users']
const SUPPORT_ICONS = ['House', 'Church', 'HandHelping', 'CalendarDays', 'Accessibility', 'Phone']

// DT-902: Preserve translated paragraphs and benefit lists without leaking object values into JSX.
function referenceItems (t, base, count) {
  return Array.from({ length: count }, (_, index) => {
    const key = `card${index + 1}`
    const description = t(`${base}.cards.${key}.description`, { returnObjects: true })
    const clean = text => text.replace(/^\s*-\s*/, '')
    return {
      id: key,
      title: t(`${base}.cards.${key}.title`),
      description: typeof description === 'string' ? description : clean(description.top),
      listItems: typeof description === 'object'
        ? Object.entries(description).filter(([name]) => name.startsWith('list')).map(([, text]) => clean(text))
        : undefined
    }
  })
}

// DT-732: Retain stack/cards/timeline styling for Hospice.
// DT-902: Restore full Sprint 08 content, including separate benefits and support-services sections.
// DT-902: Fallback CMS sections use global colours on this public page.
export default function HospiceSections ({ sections, theme = 'light' }) {
  const { t } = useTranslation()
  return sections.map(section => {
    const key = section.id
    // DT-902: Match Welcome’s split hero geometry with page-specific colors and photo placement.
    if (key === 'sec-hospice-hero') {
      return (
        <HeroSection
          variant='split' className='c4-hospice-hero'
          key={section.id} title={t('hospice.blurb.title')} description={t('hospice.blurb.description')}
          imageUrl={compassionImage} showOverlay={false} tone='forest' contentPosition='right' iconName='Heart'
          buttonText={t('hospice.blurb.contactButton')} buttonLink='/schedule'
        />
      )
    }
    if (key === 'sec-hospice-contact') {
      return <PageCallToAction key={key} title={t('hospice.hospiceContact.title')} description={t('hospice.hospiceContact.description')} primaryLabel={t('hospice.hospiceContact.contactButton')} homeLabel={t('hospice.hospiceContact.homeButton')} />
    }
    if (key === 'sec-hospice-understanding') {
      return <HeaderStackSection key={key} title={t('hospice.understanding.title')} items={referenceItems(t, 'hospice.understanding', 5)} />
    }
    if (key === 'sec-hospice-benefits' || key === 'sec-hospice-comprehensive') {
      const base = key === 'sec-hospice-benefits' ? 'hospice.careAndBenefits' : 'hospice.comprehensiveServices'
      const icons = key === 'sec-hospice-benefits' ? BENEFIT_ICONS : SUPPORT_ICONS
      const items = referenceItems(t, base, 6).map((item, index) => ({ ...item, iconName: icons[index] }))
      // DT-902: Add localized heading introductions and keep Comprehensive Support cards on the left.
      return <HeaderCardsSection key={key} title={t(`${base}.title`)} label={t(`${base}.label`)} subtitle={t(`${base}.subtitle`)} items={items} headerPosition={key === 'sec-hospice-comprehensive' ? 'right' : 'left'} />
    }
    if (key === 'sec-hospice-above-beyond') {
      const items = Array.from({ length: 7 }, (_, index) => ({ id: `above-${index}`, title: t(`hospice.aboveAndBeyond.cards.card${index + 1}`) }))
      return <HeaderStackSection key={key} title={t('hospice.aboveAndBeyond.title')} subtitle={t('hospice.aboveAndBeyond.description')} items={items} />
    }
    if (key === 'sec-hospice-process') {
      return <TimelineSection key={key} title={t('hospice.hospiceProcess.title')} items={referenceItems(t, 'hospice.hospiceProcess', 5)} />
    }
    return <DynamicSectionRenderer key={key} config={section} colorSource='global' theme={theme} />
  })
}
