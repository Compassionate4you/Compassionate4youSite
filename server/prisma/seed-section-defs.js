const { get, perLanguage } = require('./seed-card-helpers');

// Welcome card copy lives in the translation files; only card metadata lives here.
const WELCOME_CARDS = [
    {
        imageUrl: '/images/working_a_puzzle_together.jpeg',
        alignment: 'left',
        baseKey: 'landing.infoCards.card1',
    },
    {
        imageUrl: '/images/older_couple_smiling.jpeg',
        alignment: 'right',
        baseKey: 'landing.infoCards.card2',
    },
];

const SERVICE_KEYS = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual'];
const ABOVE_AND_BEYOND_KEYS = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7'];
const HOSPICE_PROCESS_KEYS = ['card1', 'card2', 'card3', 'card4', 'card5'];

function hospiceCards(locales, base, count) {
    return Array.from({ length: count }, (_, index) => {
        const n = index + 1;
        return {
            layoutType: 'HEADER_PARAGRAPH',
            header: perLanguage(locales, `${base}.cards.card${n}.title`),
            paragraph: perLanguage(locales, `${base}.cards.card${n}.description`),
            imageUrl: null,
            imageAlt: {},
            symbol: null,
            alignment: 'left',
        };
    });
}

function aboveAndBeyondCards(locales) {
    return ABOVE_AND_BEYOND_KEYS.map((key) => ({
        layoutType: 'HEADER_SYMBOL',
        header: perLanguage(locales, `hospice.aboveAndBeyond.cards.${key}`),
        paragraph: {},
        imageUrl: null,
        imageAlt: {},
        symbol: 'check',
        alignment: 'left',
    }));
}

function hospiceProcessCards(locales) {
    return HOSPICE_PROCESS_KEYS.map((key) => ({
        layoutType: 'HEADER_PARAGRAPH',
        header: perLanguage(locales, `hospice.hospiceProcess.cards.${key}.title`),
        paragraph: perLanguage(locales, `hospice.hospiceProcess.cards.${key}.description`),
        imageUrl: null,
        imageAlt: {},
        symbol: get(locales.en, `hospice.hospiceProcess.cards.${key}.number`) || '',
        alignment: 'center',
    }));
}

function buildSectionDefs(locales) {
    return [
        {
            slug: 'welcome-philosophy', page: 'welcome', position: 0, title: {}, rows: 1, columns: 1, cardCount: 1,
            cards: [{ layoutType: 'HEADER_PARAGRAPH', header: perLanguage(locales, 'landing.philosophyTitle'), paragraph: perLanguage(locales, 'landing.philosophyText'), imageUrl: null, imageAlt: {}, symbol: null, alignment: 'center' }],
        },
        {
            slug: 'welcome-caring-since', page: 'welcome', position: 1, title: {}, rows: 1, columns: 1, cardCount: 1,
            cards: [{ layoutType: 'HEADER_PARAGRAPH', header: perLanguage(locales, 'landing.caringSinceTitle'), paragraph: perLanguage(locales, 'landing.caringSinceText'), imageUrl: null, imageAlt: {}, symbol: null, alignment: 'center' }],
        },
        {
            slug: 'welcome-info', page: 'welcome', position: 2, title: {}, rows: 2, columns: 1, cardCount: WELCOME_CARDS.length,
            cards: WELCOME_CARDS.map((card) => ({ layoutType: 'IMAGE_FULL_WIDTH', header: perLanguage(locales, `${card.baseKey}.header`), paragraph: perLanguage(locales, `${card.baseKey}.paragraph`), imageUrl: card.imageUrl, imageAlt: perLanguage(locales, `${card.baseKey}.imageAlt`), symbol: null, alignment: card.alignment })),
        },
        {
            slug: 'welcome-about', page: 'welcome', position: 3, title: {}, rows: 1, columns: 1, cardCount: 1,
            cards: [{ layoutType: 'HEADER_PARAGRAPH', header: perLanguage(locales, 'landing.aboutTitle'), paragraph: perLanguage(locales, 'landing.aboutText'), imageUrl: null, imageAlt: {}, symbol: null, alignment: 'center' }],
        },
        {
            slug: 'homehealth-services', page: 'homeHealth', position: 0, title: perLanguage(locales, 'homeHealth.servicesHeading'), rows: 2, columns: 4, cardCount: SERVICE_KEYS.length,
            cards: SERVICE_KEYS.map((key) => ({ layoutType: 'HEADER_SYMBOL', header: perLanguage(locales, `homeHealth.services.${key}`), paragraph: perLanguage(locales, `homeHealth.services.${key}Desc`), imageUrl: null, imageAlt: {}, symbol: 'heart', alignment: 'left' })),
        },
        {
            slug: 'hospice-understanding', page: 'hospice', position: 0, title: perLanguage(locales, 'hospice.understanding.title'), rows: 2, columns: 3, cardCount: 5,
            cards: hospiceCards(locales, 'hospice.understanding', 5),
        },
        {
            slug: 'hospice-care-benefits', page: 'hospice', position: 1, title: perLanguage(locales, 'hospice.careAndBenefits.title'), rows: 2, columns: 3, cardCount: 6,
            cards: hospiceCards(locales, 'hospice.careAndBenefits', 6),
        },
        {
            slug: 'hospice-comprehensive', page: 'hospice', position: 2, title: perLanguage(locales, 'hospice.comprehensiveServices.title'), rows: 2, columns: 3, cardCount: 6,
            cards: hospiceCards(locales, 'hospice.comprehensiveServices', 6),
        },
        {
            slug: 'hospice-above-beyond-items', page: 'hospice', position: 3, title: perLanguage(locales, 'hospice.aboveAndBeyond.title'), rows: 7, columns: 1, cardCount: ABOVE_AND_BEYOND_KEYS.length,
            cards: aboveAndBeyondCards(locales),
        },
        {
            slug: 'hospice-care-process', page: 'hospice', position: 4, title: perLanguage(locales, 'hospice.hospiceProcess.title'), rows: 2, columns: 3, cardCount: HOSPICE_PROCESS_KEYS.length,
            cards: hospiceProcessCards(locales),
        },
    ];
}

module.exports = { buildSectionDefs };
