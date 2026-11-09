import { useTranslation } from 'react-i18next'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import BannerSection, { getWelcomeBannerIcon } from './sections/BannerSection'
import WelcomeHeroSection from './sections/WelcomeHeroSection'
import careImage from '../../assets/images/CareImage1.jpeg'
import ContactFormSection from './sections/ContactFormSection'
import MapSection from './sections/MapSection'
import LocationMaps from './sections/LocationMaps'
import FAQSection from './sections/FAQSection'
import PhotoTextCard from './cards/PhotoTextCard'
import puzzleImage from '../../assets/images/working_a_puzzle_together.jpeg'
import coupleImage from '../../assets/images/older_couple_smiling.jpeg'
import TypographyScope from './TypographyScope'

// DT-902: Restore Welcome reference copy while keeping banners, image cards, form, and map behavior.
// DT-902: Fallback CMS sections use global colours on this public page.
// DT-718: Present the FAQ immediately before the map for existing CMS content.
export default function WelcomeSections ({ sections, theme = 'light' }) {
  const { t } = useTranslation()
  // DT-718: Reorder a copy, preserving other sections and incomplete page configurations.
  const orderedSections = [...sections]
  const faqIndex = orderedSections.findIndex(section => section.id === 'sec-landing-faq')
  if (faqIndex !== -1 && orderedSections.some(section => section.id === 'sec-landing-map')) {
    const [faq] = orderedSections.splice(faqIndex, 1)
    const mapIndex = orderedSections.findIndex(section => section.id === 'sec-landing-map')
    orderedSections.splice(mapIndex, 0, faq)
  }
  const renderSection = section => {
    const key = section.id
    // DT-902: Cover both seeded CMS and initial local-cache hero identifiers.
    if (key === 'sec-landing-hero' || key === 'sec-hero') {
      return <WelcomeHeroSection key={key} title={t('landing.heroTitle')} description={t('landing.heroSubtitle')} imageUrl={careImage} imageAlt={t('landing.heroImageAlt')} />
    }
    const banner = {
      'sec-landing-philosophy': ['philosophyTitle', 'philosophyText', 'welcome-philosophy'],
      'sec-landing-caring': ['caringSinceTitle', 'caringSinceText', 'welcome-caring-since'],
      'sec-landing-about': ['aboutTitle', 'aboutText', 'welcome-about']
    }[key]
    if (banner) {
      return <div key={key} className='c4-welcome-banners'><BannerSection title={t(`landing.${banner[0]}`)} description={t(`landing.${banner[1]}`)} Icon={getWelcomeBannerIcon(banner[2])} /></div>
    }
    if (key === 'sec-landing-info-cards') {
      return (
        <div key={key} className='c4-photo-cards'>
          {[[puzzleImage, 'left'], [coupleImage, 'right']].map(([image, alignment], index) => (
            <PhotoTextCard key={image} header={t(`landing.infoCards.card${index + 1}.header`)} paragraph={t(`landing.infoCards.card${index + 1}.paragraph`)} imageAlt={t(`landing.infoCards.card${index + 1}.imageAlt`)} imageUrl={image} imagePosition={alignment} />
          ))}
        </div>
      )
    }
    if (key === 'sec-landing-contact') {
      const content = Object.fromEntries(['phone', 'email', 'fax', 'addressLine1', 'addressLine2'].map(field => [field, t(`landing.contact${field[0].toUpperCase()}${field.slice(1)}`)]))
      return <div key={key} id='contact'><ContactFormSection content={{ ...content, title: t('landing.contactTitle') }} /></div>
    }
    // DT-909: one map per location from the locations database, in the same
    // style. The previous fixed map is kept only as a fallback if the
    // locations cannot be loaded.
    if (key === 'sec-landing-map') {
      const fallback = <MapSection content={{ hideHeading: true, header: t('locations.mapTitle'), mapAddress: `${t('landing.contactAddressLine1')} ${t('landing.contactAddressLine2')}`, directionsText: t('locations.getDirections') }} />
      return <LocationMaps key={key} fallback={fallback} mapTitle={t('locations.mapTitle')} directionsText={t('locations.getDirections')} />
    }
    if (key === 'sec-landing-faq') {
      return <FAQSection key={key} content={{ title: t('faq.title'), faqItems: t('faq.items', { returnObjects: true }) }} />
    }
    return <DynamicSectionRenderer key={key} config={section} colorSource='global' theme={theme} />
  }
  // DT-893: apply each section's saved formatting (from the content editor)
  // to its title and description. Sections without any render unchanged.
  return orderedSections.map(section => (
    <TypographyScope key={section.id} typography={section.content?.typography}>
      {renderSection(section)}
    </TypographyScope>
  ))
}
