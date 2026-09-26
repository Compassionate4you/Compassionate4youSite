import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// i18n is initialised for real in the app; in tests we return the key so
// assertions do not depend on copy that may change.
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
    }),
    initReactI18next: { type: '3rdParty', init: () => {} },
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
