import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import pa from './locales/pa/translation.json';
import ur from './locales/ur/translation.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
    pa: { translation: pa },
    ur: { translation: ur },
};

/*  Adjust page format so urdu can be read from right to left easily  */
function applyDocumentLanguage(language) {
    if (typeof document === 'undefined') return;
    const locale = String(language || 'en').split('-')[0];
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
}

i18n.use(initReactI18next).init({
    resources,
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
