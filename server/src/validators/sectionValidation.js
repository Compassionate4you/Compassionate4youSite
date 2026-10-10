// Validation for editable card sections
// Returns { ok: true, value } with cleaned data, or { ok: false, message, field }.

const LAYOUTS = ['IMAGE_FULL_WIDTH', 'HEADER_PARAGRAPH', 'HEADER_SYMBOL'];
const LANGUAGES = ['en', 'es', 'pa', 'zh', 'vi'];
const ALIGNMENTS = ['left', 'center', 'right'];

const LIMITS = {
    maxRows: 6,
    maxColumns: 4,
    maxCards: 24,
    title: 200,
    header: 200,
    paragraph: 3000,
    imageUrl: 500,
    imageAlt: 300,
    symbol: 32,
};

function fail(message, field = null) {
    return { ok: false, message, field };
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Accepts { en: '...', es: '...' }. Trims, drops blank entries, and rejects
// unknown languages and over-long text.
function cleanLocalized(value, field, maxLength) {
    if (value === undefined || value === null) return { ok: true, value: {} };
    if (!isPlainObject(value)) return fail('Text must be given per language.', field);

    const cleaned = {};
    for (const [language, text] of Object.entries(value)) {
        if (!LANGUAGES.includes(language)) {
            return fail(`"${language}" is not a supported language.`, field);
        }
        if (typeof text !== 'string') return fail('Text must be a string.', field);

        const trimmed = text.trim();
        if (trimmed === '') continue;
        if (trimmed.length > maxLength) {
            return fail(`Text is too long (max ${maxLength} characters).`, field);
        }
        cleaned[language] = trimmed;
    }
    return { ok: true, value: cleaned };
}

// Site-relative path ("/images/x.jpg") or an http(s) URL. Blocks things like
// "javascript:" and protocol-relative "//host" links.
function isValidImageUrl(url) {
    return /^\/(?!\/)\S*$/.test(url) || /^https?:\/\/\S+$/i.test(url);
}

function validateCard(card, index) {
    const prefix = `cards[${index}]`;
    if (!isPlainObject(card)) return fail('Each card must be an object.', prefix);

    const { layoutType } = card;
    if (!LAYOUTS.includes(layoutType)) {
        return fail('Choose a card layout.', `${prefix}.layoutType`);
    }

    const header = cleanLocalized(card.header, `${prefix}.header`, LIMITS.header);
    if (!header.ok) return header;
    if (!header.value.en) {
        return fail('Every card needs an English header.', `${prefix}.header`);
    }

    const paragraph = cleanLocalized(card.paragraph, `${prefix}.paragraph`, LIMITS.paragraph);
    if (!paragraph.ok) return paragraph;
    if (layoutType === 'HEADER_PARAGRAPH' && !paragraph.value.en) {
        return fail('This layout needs an English paragraph.', `${prefix}.paragraph`);
    }

    const alignment = card.alignment ?? 'left';
    if (!ALIGNMENTS.includes(alignment)) {
        return fail('Choose left, center or right.', `${prefix}.alignment`);
    }

    let imageUrl = null;
    let imageAlt = {};
    let symbol = null;

    if (layoutType === 'IMAGE_FULL_WIDTH') {
        if (typeof card.imageUrl !== 'string' || card.imageUrl.trim() === '') {
            return fail('This layout needs an image.', `${prefix}.imageUrl`);
        }
        imageUrl = card.imageUrl.trim();
        if (imageUrl.length > LIMITS.imageUrl || !isValidImageUrl(imageUrl)) {
            return fail(
                'Use an image path starting with "/" or a full http(s) address.',
                `${prefix}.imageUrl`
            );
        }
        const alt = cleanLocalized(card.imageAlt, `${prefix}.imageAlt`, LIMITS.imageAlt);
        if (!alt.ok) return alt;
        imageAlt = alt.value;
    }

    if (layoutType === 'HEADER_SYMBOL') {
        if (typeof card.symbol !== 'string' || card.symbol.trim() === '') {
            return fail('This layout needs a symbol.', `${prefix}.symbol`);
        }
        symbol = card.symbol.trim();
        if (symbol.length > LIMITS.symbol) {
            return fail(`Symbol is too long (max ${LIMITS.symbol} characters).`, `${prefix}.symbol`);
        }
    }

    return {
        ok: true,
        value: {
            layoutType,
            header: header.value,
            paragraph: paragraph.value,
            imageUrl,
            imageAlt,
            symbol,
            alignment,
        },
    };
}

function validateSectionPayload(body) {
    if (!isPlainObject(body)) return fail('A section is required.');

    const { rows, columns, cardCount, cards } = body;

    if (!Number.isInteger(rows) || rows < 1 || rows > LIMITS.maxRows) {
        return fail(`Rows must be a whole number from 1 to ${LIMITS.maxRows}.`, 'rows');
    }
    if (!Number.isInteger(columns) || columns < 1 || columns > LIMITS.maxColumns) {
        return fail(`Columns must be a whole number from 1 to ${LIMITS.maxColumns}.`, 'columns');
    }

    if (!Array.isArray(cards)) return fail('Cards must be a list.', 'cards');
    if (cards.length > LIMITS.maxCards) {
        return fail(`A section can hold at most ${LIMITS.maxCards} cards.`, 'cards');
    }

    const capacity = rows * columns;
    if (!Number.isInteger(cardCount) || cardCount < 0 || cardCount > capacity) {
        return fail(
            `The number of cards to show must be between 0 and ${capacity} (rows x columns).`,
            'cardCount'
        );
    }
    if (cardCount > cards.length) {
        return fail('You chose to show more cards than the section has.', 'cardCount');
    }

    const title = cleanLocalized(body.title, 'title', LIMITS.title);
    if (!title.ok) return title;

    const cleanedCards = [];
    for (let i = 0; i < cards.length; i += 1) {
        const result = validateCard(cards[i], i);
        if (!result.ok) return result;
        cleanedCards.push(result.value);
    }

    return {
        ok: true,
        value: { title: title.value, rows, columns, cardCount, cards: cleanedCards },
    };
}

module.exports = { validateSectionPayload, LAYOUTS, LANGUAGES, ALIGNMENTS, LIMITS };