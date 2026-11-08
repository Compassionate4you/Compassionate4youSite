import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Heart, House } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import resolveImageUrl from '../resolveImageUrl'
import '../../../styles/components/modular/sections/HeroSection.css'

// DT-902: Share the site's supported language values with the Welcome hero selector.
const LANGUAGES = [
  ['en', 'English'], ['es', 'Español'], ['pa', 'ਪੰਜਾਬੀ'], ['ur', 'اردو'],
  ['zh', '普通话'], ['vi', 'tiếng việt'], ['hi', 'हिन्दी']
]

// DT-902: Allow individual pages to show untinted photos while retaining the default overlay.
// DT-902: Reusable split-photo/background hero with optional imagery, icons, CTA, and language control.
export default function HeroSection ({
  title, description, imageUrl, imageAlt = '', variant = 'background',
  contentPosition = 'left', tone = 'teal', iconName,
  buttonText, buttonLink = '/schedule', showOverlay = true, showLanguageSelector = false, className = ''
}) {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const languageId = useId()
  const [failedImage, setFailedImage] = useState(null)
  const resolvedImage = resolveImageUrl(imageUrl)
  const hasImage = Boolean(resolvedImage && failedImage !== resolvedImage)
  const split = variant === 'split'
  const Icon = iconName === 'House' ? House : iconName === 'Heart' ? Heart : null
  const currentLanguage = LANGUAGES.find(([code]) => i18n.language?.startsWith(code))?.[0] || 'en'

  return (
    <section
      className={`c4-hero c4-hero--${split ? 'split' : 'background'} c4-hero--${contentPosition === 'right' ? 'right' : 'left'} c4-hero--${tone === 'forest' ? 'forest' : 'teal'}${hasImage ? ' c4-hero--image' : ''}${!showOverlay ? ' c4-hero--no-overlay' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby={title ? titleId : undefined}
    >
      {hasImage && (
        <img className='c4-hero__image' src={resolvedImage} alt={split ? imageAlt : ''} fetchPriority='high' onError={() => setFailedImage(resolvedImage)} />
      )}
      <div className='c4-hero__content'>
        <div className='c4-hero__heading'>
          {Icon && <span className={`c4-hero__icon${iconName === 'Heart' ? ' c4-hero__icon--heart' : ''}`} aria-hidden='true'><Icon focusable='false' /></span>}
          {title && <h1 id={titleId} className='c4-hero__title'>{title}</h1>}
        </div>
        {description && <p className='c4-hero__description'>{description}</p>}
        {buttonText && (buttonLink.startsWith('http')
          ? <a className='c4-hero__cta' href={buttonLink} target='_blank' rel='noopener noreferrer'>{buttonText}</a>
          : <Link className='c4-hero__cta' to={buttonLink}>{buttonText}</Link>)}
        {showLanguageSelector && (
          <div className='c4-hero__language'>
            <label htmlFor={languageId}><Globe aria-hidden='true' focusable='false' />{t('accessibility.language')}</label>
            <select id={languageId} value={currentLanguage} onChange={event => i18n.changeLanguage(event.target.value)}>
              {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>
        )}
      </div>
    </section>
  )
}
