import { useTranslation } from 'react-i18next'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import HeaderCardsSection from './sections/HeaderCardsSection'
import HeroSection from './sections/HeroSection'
import careImage from '../../assets/images/CareImage1.jpeg'
import PageCallToAction from './sections/PageCallToAction'

// DT-731: Keep the eight screenshot service names in their original reading order.
const SERVICE_KEYS = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual']

// DT-731: Present screenshot content from translations using the new Home Health layouts.
// DT-902: Restore the reference hero and closing call to action alongside the existing cards.
export default function HomeHealthSections ({ sections, theme = 'light' }) {
  const { t } = useTranslation()

  return sections.map(section => {
    if (section.id === 'sec-hh-hero') {
      return (
        <HeroSection
          key={section.id} title={t('homeHealth.title')} description={t('homeHealth.subtitle')}
          imageUrl={careImage} tone='teal' contentPosition='left' iconName='House'
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
        iconName: 'Heart'
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealth.servicesHeading')} items={items} />
    }
    // DT-731: Place the advantages heading on the right and its seven cards on the left.
    if (section.id === 'sec-hh-advantages') {
      const items = t('homeHealthPage.advantages', { returnObjects: true }).map((description, index) => ({
        id: `advantage-${index}`,
        description
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealthPage.advantagesTitle')} items={items} headerPosition='right' />
    }
    if (section.id === 'sec-hh-specialties') {
      const items = t('homeHealthPage.specialties', { returnObjects: true }).map((title, index) => ({
        id: `specialty-${index}`,
        title,
        iconName: 'Heart'
      }))
      return <HeaderCardsSection key={section.id} title={t('homeHealthPage.specialtyTitle')} items={items} />
    }
    return <DynamicSectionRenderer key={section.id} config={section} theme={theme} />
  })
}
