// Card sections. Mounted at /api/sections.
//   GET  /api/sections              admin  - list sections for the editor
//   GET  /api/sections/:slug        public - the cards the page should show
//   GET  /api/sections/:slug/edit   admin  - every card, including hidden ones
//   PUT  /api/sections/:slug        admin  - replace a section's settings and cards
const prisma = require('../config/db');
const { sendValidationError } = require('../utils/errorResponse');
const { validateSectionPayload } = require('../validators/sectionValidation');

function sectionNotFound(res) {
    return res.status(404).json({
        success: false,
        error: { message: 'That section does not exist.', field: 'slug' },
    });
}

function serializeCard(card) {
    return {
        id: card.id,
        position: card.position,
        layoutType: card.layoutType,
        header: card.header,
        paragraph: card.paragraph,
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt,
        symbol: card.symbol,
        alignment: card.alignment,
    };
}

// visibleOnly: the public page only gets the first `cardCount` cards, never
// more than the grid can hold.
function serializeSection(section, { visibleOnly }) {
    const ordered = [...section.cards].sort((a, b) => a.position - b.position);
    const visibleCount = Math.min(section.cardCount, section.rows * section.columns);
    const cards = visibleOnly ? ordered.slice(0, visibleCount) : ordered;

    return {
        id: section.id,
        slug: section.slug,
        page: section.page,
        title: section.title,
        rows: section.rows,
        columns: section.columns,
        cardCount: section.cardCount,
        cards: cards.map(serializeCard),
    };
}

const WITH_CARDS = { cards: { orderBy: { position: 'asc' } } };

// GET /api/sections/:slug
async function getSection(req, res, next) {
    try {
        const section = await prisma.cardSection.findUnique({
            where: { slug: req.params.slug },
            include: WITH_CARDS,
        });
        if (!section) return sectionNotFound(res);

        return res.status(200).json({ section: serializeSection(section, { visibleOnly: true }) });
    } catch (err) {
        return next(err);
    }
}

// GET /api/sections/:slug/edit
async function getSectionForEdit(req, res, next) {
    try {
        const section = await prisma.cardSection.findUnique({
            where: { slug: req.params.slug },
            include: WITH_CARDS,
        });
        if (!section) return sectionNotFound(res);

        return res.status(200).json({ section: serializeSection(section, { visibleOnly: false }) });
    } catch (err) {
        return next(err);
    }
}

// GET /api/sections
async function listSections(req, res, next) {
    try {
        const sections = await prisma.cardSection.findMany({
            select: { slug: true, page: true, title: true },
            orderBy: [{ page: 'asc' }, { position: 'asc' }],
        });
        return res.status(200).json({ sections });
    } catch (err) {
        return next(err);
    }
}

// PUT /api/sections/:slug
async function updateSection(req, res, next) {
    try {
        const result = validateSectionPayload(req.body);
        if (!result.ok) return sendValidationError(res, result.message, result.field);

        const existing = await prisma.cardSection.findUnique({
            where: { slug: req.params.slug },
        });
        if (!existing) return sectionNotFound(res);

        const { value } = result;

        // Replace the cards in one transaction so a failure never leaves a
        // half-edited section.
        const updated = await prisma.$transaction(async (tx) => {
            await tx.card.deleteMany({ where: { sectionId: existing.id } });

            if (value.cards.length > 0) {
                await tx.card.createMany({
                    data: value.cards.map((card, index) => ({
                        sectionId: existing.id,
                        position: index,
                        ...card,
                    })),
                });
            }

            return tx.cardSection.update({
                where: { id: existing.id },
                data: {
                    title: value.title,
                    rows: value.rows,
                    columns: value.columns,
                    cardCount: value.cardCount,
                },
                include: WITH_CARDS,
            });
        });

        return res
            .status(200)
            .json({ success: true, section: serializeSection(updated, { visibleOnly: false }) });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getSection, getSectionForEdit, listSections, updateSection };