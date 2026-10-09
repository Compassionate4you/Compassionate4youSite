import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/translation.json'
import es from './locales/es/translation.json'
import pa from './locales/pa/translation.json' // DT-145 : Punjabi language
import hi from './locales/hi/translation.json' // DT-147 : Hindi language

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pa: { translation: pa },
    hi: { translation: hi }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
