// Moves the current Welcome, Home Health and Hospice card copy into the database.
//
//   node prisma/seed-cards.js            create sections that don't exist yet
//   node prisma/seed-cards.js --force    DELETE and recreate every seeded section
//
// Text comes straight from client/src/locales/*/translation.json, so the
// database starts out identical to what the site shows today. Sections that
// already exist are left alone, so an admin's edits are never overwritten
// unless you pass --force.
//
// To also create (or promote) an admin account, set ADMIN_EMAIL and
// ADMIN_PASSWORD in server/.env before running.
const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'es', 'pa', 'ur', 'zh', 'vi', 'hi'];
const LOCALES_DIR = path.resolve(__dirname, '../../client/src/locales');

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

function get(object, keyPath) {
    return keyPath
        .split('.')
        .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

function stripDash(text) {
    return String(text).replace(/^\s*-\s*/, '').trim();
}

// Hospice cards 3 and 6 store { top, list1, list2... }. Cards keep one text
// field, so bullets become lines starting with "- ".
function flattenText(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
        const { top, ...rest } = value;
        const items = Object.keys(rest)
            .filter((key) => /^list\d+$/.test(key))
            .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
            .map((key) => `- ${stripDash(rest[key])}`);
        return [top ? stripDash(top) : null, ...items].filter(Boolean).join('\n');
    }
    return '';
}

// { en: '...', es: '...' } from one translation key. Skips languages that lack
// the key, and values the translation script marked "[UNTRANSLATED: xx]".
function perLanguage(locales, keyPath) {
    const result = {};
    for (const [language, dictionary] of Object.entries(locales)) {
        const raw = get(dictionary, keyPath);
        if (raw === undefined) continue;
        const text = flattenText(raw);
        if (!text || text.startsWith('[UNTRANSLATED')) continue;
        result[language] = text;
    }
    return result;
}

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
            slug: 'welcome-philosophy',
            page: 'welcome',
            position: 0,
            title: {},
            rows: 1,
            columns: 1,
            cardCount: 1,
            cards: [
                {
                    layoutType: 'HEADER_PARAGRAPH',
                    header: perLanguage(locales, 'landing.philosophyTitle'),
                    paragraph: perLanguage(locales, 'landing.philosophyText'),
                    imageUrl: null,
                    imageAlt: {},
                    symbol: null,
                    alignment: 'center',
                },
            ],
        },
        {
            slug: 'welcome-caring-since',
            page: 'welcome',
            position: 1,
            title: {},
            rows: 1,
            columns: 1,
            cardCount: 1,
            cards: [
                {
                    layoutType: 'HEADER_PARAGRAPH',
                    header: perLanguage(locales, 'landing.caringSinceTitle'),
                    paragraph: perLanguage(locales, 'landing.caringSinceText'),
                    imageUrl: null,
                    imageAlt: {},
                    symbol: null,
                    alignment: 'center',
                },
            ],
        },
        {
            slug: 'welcome-info',
            page: 'welcome',
            position: 2,
            title: {},
            rows: 2,
            columns: 1,
            cardCount: WELCOME_CARDS.length,
            cards: WELCOME_CARDS.map((card) => ({
                layoutType: 'IMAGE_FULL_WIDTH',
                header: perLanguage(locales, `${card.baseKey}.header`),
                paragraph: perLanguage(locales, `${card.baseKey}.paragraph`),
                imageUrl: card.imageUrl,
                imageAlt: perLanguage(locales, `${card.baseKey}.imageAlt`),
                symbol: null,
                alignment: card.alignment,
            })),
        },
        {
            slug: 'welcome-about',
            page: 'welcome',
            position: 3,
            title: {},
            rows: 1,
            columns: 1,
            cardCount: 1,
            cards: [
                {
                    layoutType: 'HEADER_PARAGRAPH',
                    header: perLanguage(locales, 'landing.aboutTitle'),
                    paragraph: perLanguage(locales, 'landing.aboutText'),
                    imageUrl: null,
                    imageAlt: {},
                    symbol: null,
                    alignment: 'center',
                },
            ],
        },
        {
            slug: 'homehealth-services',
            page: 'homeHealth',
            position: 0,
            title: perLanguage(locales, 'homeHealth.servicesHeading'),
            rows: 2,
            columns: 4,
            cardCount: SERVICE_KEYS.length,
            cards: SERVICE_KEYS.map((key) => ({
                layoutType: 'HEADER_SYMBOL',
                header: perLanguage(locales, `homeHealth.services.${key}`),
                paragraph: perLanguage(locales, `homeHealth.services.${key}Desc`),
                imageUrl: null,
                imageAlt: {},
                symbol: 'heart',
                alignment: 'left',
            })),
        },
        {
            slug: 'hospice-understanding',
            page: 'hospice',
            position: 0,
            title: perLanguage(locales, 'hospice.understanding.title'),
            rows: 2,
            columns: 3,
            cardCount: 5,
            cards: hospiceCards(locales, 'hospice.understanding', 5),
        },
        {
            slug: 'hospice-care-benefits',
            page: 'hospice',
            position: 1,
            title: perLanguage(locales, 'hospice.careAndBenefits.title'),
            rows: 2,
            columns: 3,
            cardCount: 6,
            cards: hospiceCards(locales, 'hospice.careAndBenefits', 6),
        },
        {
            slug: 'hospice-comprehensive',
            page: 'hospice',
            position: 2,
            title: perLanguage(locales, 'hospice.comprehensiveServices.title'),
            rows: 2,
            columns: 3,
            cardCount: 6,
            cards: hospiceCards(locales, 'hospice.comprehensiveServices', 6),
        },
        {
            slug: 'hospice-above-beyond-items',
            page: 'hospice',
            position: 3,
            title: perLanguage(locales, 'hospice.aboveAndBeyond.title'),
            rows: 7,
            columns: 1,
            cardCount: ABOVE_AND_BEYOND_KEYS.length,
            cards: aboveAndBeyondCards(locales),
        },
        {
            slug: 'hospice-care-process',
            page: 'hospice',
            position: 4,
            title: perLanguage(locales, 'hospice.hospiceProcess.title'),
            rows: 2,
            columns: 3,
            cardCount: HOSPICE_PROCESS_KEYS.length,
            cards: hospiceProcessCards(locales),
        },
    ];
}

function loadLocales(dir = LOCALES_DIR) {
    const locales = {};
    for (const language of LANGUAGES) {
        const file = path.join(dir, language, 'translation.json');
        if (!fs.existsSync(file)) {
            console.warn(`No translation file for "${language}" - skipping.`);
            continue;
        }
        try {
            locales[language] = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (err) {
            console.warn(`Could not read ${file}: ${err.message} - skipping.`);
        }
    }
    return locales;
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const prisma = require('../src/config/db');
    const force = process.argv.includes('--force');

    try {
        const locales = loadLocales();
        if (!locales.en) throw new Error('client/src/locales/en/translation.json is required.');

        for (const def of buildSectionDefs(locales)) {
            const existing = await prisma.cardSection.findUnique({ where: { slug: def.slug } });

            if (existing && !force) {
                console.log(`Skipped   ${def.slug} (already exists - use --force to reset it)`);
                continue;
            }
            if (existing) {
                await prisma.cardSection.delete({ where: { id: existing.id } });
            }

            const { cards, ...section } = def;
            await prisma.cardSection.create({
                data: {
                    ...section,
                    cards: { create: cards.map((card, position) => ({ position, ...card })) },
                },
            });
            console.log(`Created   ${def.slug} (${cards.length} cards)`);
        }

        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        if (ADMIN_EMAIL && ADMIN_PASSWORD) {
            const bcrypt = require('bcryptjs');
            const email = ADMIN_EMAIL.trim().toLowerCase();
            const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await prisma.user.upsert({
                where: { email },
                update: { role: 'admin' },
                create: { email, password, role: 'admin' },
            });
            console.log(`Admin     ${email} can now edit cards`);
        } else {
            console.log('Admin     skipped (set ADMIN_EMAIL and ADMIN_PASSWORD to create one)');
        }
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { buildSectionDefs, flattenText, perLanguage, loadLocales };
