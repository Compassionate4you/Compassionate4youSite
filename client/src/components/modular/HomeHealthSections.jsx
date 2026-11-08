import { useTranslation } from 'react-i18next'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import HeaderCardsSection from './sections/HeaderCardsSection'
import HeroSection from './sections/HeroSection'
// DT-902: Use the young Asian caregiver photo for the Home Health hero.
import careImage from '../../assets/images/asian-young-caregiver-caring-her-elderly-patient-senior-daycare-handicap-patient-wheelchair-hospital-talking-friendly-nurse-looking-cheerful-nurse-wheeling-senior-patient_609648-3125.jpeg'
import PageCallToAction from './sections/PageCallToAction'

// DT-731: Keep the eight screenshot service names in their original reading order.
const SERVICE_KEYS = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual']

// DT-902: Match icons to stable service keys and fixed translated list positions.
const SERVICE_ICONS = {
  doctors: 'Stethoscope',
  pt: 'Activity',
  ot: 'Accessibility',
  nurses: 'Cross',
  st: 'Speech',
  chha: 'House',
  msw: 'Users',
  multilingual: 'Languages'
}
const ADVANTAGE_ICONS = ['ClipboardCheck', 'Coins', 'TrendingUp', 'ClipboardList', 'House', 'ShieldCheck', 'GraduationCap']
const SPECIALTY_ICONS = ['HeartPulse', 'Wind', 'Bone', 'Bandage', 'Droplets', 'Activity', 'Pill', 'FlaskConical', 'Apple', 'TestTube']

// DT-731: Present screenshot content from translations using the new Home Health layouts.
// DT-902: Restore the reference hero and closing call to action alongside the existing cards.
// DT-902: Fallback CMS sections use global colours on this public page.
// DT-902: Supply localized preview-style labels and introductory copy to all three card headings.
export default function HomeHealthSections ({ sections, theme = 'light' }) {
  const { t } = useTranslation()

  return sections.map(section => {
    // DT-902: Match Welcome’s split hero geometry with page-specific colors and photo placement.
    if (section.id === 'sec-hh-hero') {
      return (
        <HeroSection
          variant='split' className='c4-home-health-hero'
          key={section.id} title={t('homeHealth.title')} description={t('homeHealth.subtitle')}
          imageUrl={careImage} showOverlay={false} tone='teal' contentPosition='left' iconName='House'
          buttonText={t('homeHealthPage.scheduleConsultation')} buttonLink='/schedule'
        />
      )
    }
    if (section.id === 'sec-hh-cta') {
      return <PageCallToAction key={section.id} title={t('homeHealthPage.ctaTitle')} description={t('homeHealthPage.ctaDescription')} primaryLabel={t('homeHealthPage.ctaSchedule')} homeLabel={t('homeHealthPage.ctaBack')} />
    }
    if (section.id === 'sec-hh-services') {
      const items = SERVICE_KEYS.map(key => ({
        id: key,
        title: t(`homeHealth.services.${key}`),
        iconName: SERVICE_ICONS[key]
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealth.servicesHeading')} label={t('homeHealthPage.servicesIntro.label')} subtitle={t('homeHealthPage.servicesIntro.subtitle')} surface='white' items={items} />
    }
    // DT-731: Place the advantages heading on the right and its seven cards on the left.
    if (section.id === 'sec-hh-advantages') {
      const items = t('homeHealthPage.advantages', { returnObjects: true }).map((description, index) => ({
        id: `advantage-${index}`,
        description,
        iconName: ADVANTAGE_ICONS[index]
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealthPage.advantagesTitle')} label={t('homeHealthPage.advantagesIntro.label')} subtitle={t('homeHealthPage.advantagesIntro.subtitle')} items={items} headerPosition='right' />
    }
    if (section.id === 'sec-hh-specialties') {
      const items = t('homeHealthPage.specialties', { returnObjects: true }).map((title, index) => ({
        id: `specialty-${index}`,
        title,
        iconName: SPECIALTY_ICONS[index]
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealthPage.specialtyTitle')} label={t('homeHealthPage.specialtiesIntro.label')} subtitle={t('homeHealthPage.specialtiesIntro.subtitle')} surface='white' items={items} />
    }
    return <DynamicSectionRenderer key={section.id} config={section} colorSource='global' theme={theme} />
  })
}
