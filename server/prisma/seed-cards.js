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

const LANGUAGES = ['en', 'es', 'pa', 'zh', 'vi'];
const LOCALES_DIR = path.resolve(__dirname, '../../client/src/locales');

// The Welcome cards are typed directly into LandingPage.jsx (not in the
// translation files), so their copy lives here. Languages without an entry
// fall back to English on the page.
const WELCOME_CARDS = [
    {
        imageUrl: '/images/working_a_puzzle_together.jpeg',
        alignment: 'left',
        imageAlt: {
            en: 'People working on a puzzle together',
            es: 'Personas armando un rompecabezas juntas',
            zh: '大家一起拼拼图',
            vi: 'Mọi người cùng nhau xếp hình',
        },
        header: {
            en: 'Medicare Home Health Criteria',
            es: 'Criterios de Medicare para la atención médica en el hogar',
            zh: 'Medicare 居家医疗资格标准',
            vi: 'Tiêu chí Medicare về chăm sóc sức khỏe tại nhà',
        },
        paragraph: {
            en: 'To qualify for Medicare home health services, a patient must be confined to the home and be under physician care who is a doctor of medicine, a doctor of osteopathy, or a doctor of podiatric medicine, and enrolled in the Medicare Program.',
            es: 'Para calificar para los servicios de salud en el hogar de Medicare, el paciente debe estar confinado en su hogar, estar bajo el cuidado de un médico (doctor en medicina, doctor en osteopatía o doctor en medicina podiátrica) y estar inscrito en el Programa Medicare.',
            zh: '要获得 Medicare 居家医疗服务资格，患者必须居家受限（因病难以外出），接受医学博士、整骨医学博士或足病医学博士的诊疗，并已参加 Medicare 计划。',
            vi: 'Để đủ điều kiện nhận dịch vụ chăm sóc sức khỏe tại nhà của Medicare, bệnh nhân phải bị hạn chế trong nhà, đang được bác sĩ (bác sĩ y khoa, bác sĩ nắn xương hoặc bác sĩ chuyên khoa bàn chân) chăm sóc và đã tham gia chương trình Medicare.',
        },
    },
    {
        imageUrl: '/images/older_couple_smiling.jpeg',
        alignment: 'right',
        imageAlt: {
            en: 'Older couple smiling together',
            es: 'Pareja de personas mayores sonriendo juntas',
            zh: '一对老年夫妇微笑着依偎在一起',
            vi: 'Cặp vợ chồng lớn tuổi mỉm cười bên nhau',
        },
        header: {
            en: 'Specialty Services',
            es: 'Servicios Especializados',
            zh: '专科服务',
            vi: 'Dịch vụ chuyên khoa',
        },
        paragraph: {
            en: 'To provide comprehensive, high quality home-care services to our patients by creating strong partnerships with their families, case managers, discharge planners and physicians.\n\nWe believe in creating a team of caring professionals whose goal is the care and support of our patients.',
            es: 'Brindar servicios integrales y de alta calidad de atención en el hogar a nuestros pacientes, creando alianzas sólidas con sus familias, gestores de casos, planificadores de altas médicas y médicos.\n\nCreemos en formar un equipo de profesionales atentos cuyo objetivo es el cuidado y apoyo de nuestros pacientes.',
            zh: '通过与患者家属、个案管理师、出院规划师和医生建立牢固的合作关系，为患者提供全面、高质量的居家照护服务。\n\n我们相信，要组建一支充满关爱的专业团队，以照护和支持患者为己任。',
            vi: 'Cung cấp dịch vụ chăm sóc tại nhà toàn diện, chất lượng cao cho bệnh nhân bằng cách xây dựng mối quan hệ hợp tác chặt chẽ với gia đình, nhân viên quản lý ca bệnh, người lập kế hoạch xuất viện và bác sĩ của họ.\n\nChúng tôi tin vào việc xây dựng một đội ngũ chuyên gia tận tâm với mục tiêu chăm sóc và hỗ trợ bệnh nhân của chúng tôi.',
        },
    },
];

const SERVICE_KEYS = ['doctors', 'pt', 'ot', 'nurses', 'st', 'chha', 'msw', 'multilingual'];

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

function buildSectionDefs(locales) {
    return [
        {
            slug: 'welcome-info',
            page: 'welcome',
            position: 0,
            title: {},
            rows: 2,
            columns: 1,
            cardCount: WELCOME_CARDS.length,
            cards: WELCOME_CARDS.map((card) => ({
                layoutType: 'IMAGE_FULL_WIDTH',
                header: card.header,
                paragraph: card.paragraph,
                imageUrl: card.imageUrl,
                imageAlt: card.imageAlt,
                symbol: null,
                alignment: card.alignment,
            })),
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