import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import pa from './locales/pa/translation.json'; //DT-145 : Punjabi language
import zh from './locales/zh/translation.json'; //DT-146
import vi from './locales/vi/translation.json'; //DT-143
i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
        pa: { translation: pa },
        zh: { translation: zh },
        vi: { translation: vi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;