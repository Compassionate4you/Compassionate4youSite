import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import pa from './locales/pa/translation.json'; //DT-145 : Punjabi language
import zh from './locales/zh/translation.json'; //DT-146
import vi from './locales/vi/translation.json';
import ur from './locales/ur/translation.json';//DT-143
import hi from './locales/hi/translation.json' // DT-147 : Hindi language

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
        pa: { translation: pa },
        zh: { translation: zh },
        vi: { translation: vi },
        hi: { translation: hi },
        ur: { translation: ur }
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pa', 'ur'],
    interpolation: {
        escapeValue: false,
    },
});

i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage(i18n.language);

export default i18n;
