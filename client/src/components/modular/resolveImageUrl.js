import careImage from '../../assets/images/CareImage1.jpeg'
import puzzleImage from '../../assets/images/working_a_puzzle_together.jpeg'
import coupleImage from '../../assets/images/older_couple_smiling.jpeg'

// DT-902: Translate known pre-Vite CMS image paths into bundled asset URLs.
const localImages = {
  'CareImage1.jpeg': careImage,
  'working_a_puzzle_together.jpeg': puzzleImage,
  'older_couple_smiling.jpeg': coupleImage
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
