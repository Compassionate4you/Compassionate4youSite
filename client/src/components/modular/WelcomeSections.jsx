import { useTranslation } from 'react-i18next'
import DynamicSectionRenderer from './DynamicSectionRenderer'
import BannerSection, { getWelcomeBannerIcon } from './sections/BannerSection'
import WelcomeHeroSection from './sections/WelcomeHeroSection'
import careImage from '../../assets/images/CareImage1.jpeg'
import ContactFormSection from './sections/ContactFormSection'
import MapSection from './sections/MapSection'
import FAQSection from './sections/FAQSection'
import PhotoTextCard from './cards/PhotoTextCard'
import puzzleImage from '../../assets/images/working_a_puzzle_together.jpeg'
import coupleImage from '../../assets/images/older_couple_smiling.jpeg'

// DT-902: Restore Welcome reference copy while keeping banners, image cards, form, and map behavior.
export default function WelcomeSections ({ sections, theme = 'light' }) {
  const { t } = useTranslation()
  return sections.map(section => {
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
    if (key === 'sec-landing-map') {
      return <MapSection key={key} content={{ hideHeading: true, header: t('locations.mapTitle'), mapAddress: `${t('landing.contactAddressLine1')} ${t('landing.contactAddressLine2')}`, directionsText: t('locations.getDirections') }} />
    }
    if (key === 'sec-landing-faq') {
      return <FAQSection key={key} content={{ title: t('faq.title'), faqItems: t('faq.items', { returnObjects: true }) }} />
    }
    return <DynamicSectionRenderer key={key} config={section} theme={theme} />
  })
}
