import HeroSection from './HeroSection'
import '../../../styles/components/modular/sections/WelcomeHeroSection.css'

// DT-902: Isolate Welcome's screenshot proportions while sharing language and photo behavior.
export default function WelcomeHeroSection ({ title, description, imageUrl, imageAlt }) {
  return <HeroSection className='c4-welcome-hero' variant='split' title={title} description={description} imageUrl={imageUrl} imageAlt={imageAlt} showLanguageSelector />
}
