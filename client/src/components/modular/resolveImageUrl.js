import careImage from '../../assets/images/CareImage1.jpeg'
import puzzleImage from '../../assets/images/working_a_puzzle_together.jpeg'
import coupleImage from '../../assets/images/older_couple_smiling.jpeg'
import compassionImage from '../../assets/images/compassion_image3.jpeg'
import caregiverImage from '../../assets/images/asian-young-caregiver-caring-her-elderly-patient-senior-daycare-handicap-patient-wheelchair-hospital-talking-friendly-nurse-looking-cheerful-nurse-wheeling-senior-patient_609648-3125.jpeg'
import logoImage from '../../assets/images/CompassionateLogo.jpeg'

// DT-902: Translate known pre-Vite CMS image paths into bundled asset URLs.
const localImages = {
  'CareImage1.jpeg': careImage,
  'working_a_puzzle_together.jpeg': puzzleImage,
  'older_couple_smiling.jpeg': coupleImage,
  'compassion_image3.jpeg': compassionImage,
  'asian-young-caregiver-caring-her-elderly-patient-senior-daycare-handicap-patient-wheelchair-hospital-talking-friendly-nurse-looking-cheerful-nurse-wheeling-senior-patient_609648-3125.jpeg': caregiverImage,
  'CompassionateLogo.jpeg': logoImage
}

// DT-902: Preserve custom URLs while repairing legacy paths for existing site photos.
export default function resolveImageUrl (url = '') {
  if (!url) return ''
  for (const prefix of ['/assets/images/', '/images/']) {
    if (url.startsWith(prefix)) {
      const name = url.slice(prefix.length)
      if (Object.hasOwn(localImages, name)) return localImages[name]
    }
  }
  return url
}
