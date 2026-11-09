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
const path = require('path');

const { buildSectionDefs } = require('./seed-section-defs');
const { flattenText, loadLocales, perLanguage } = require('./seed-card-helpers');
const { seedAdmin } = require('./seed-admin');

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

        await seedAdmin(prisma);
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
