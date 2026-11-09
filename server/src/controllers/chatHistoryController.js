// DT-396 / DT-398: chat history storage.
const prisma = require('../config/db');

// How many messages we keep per session.
const HISTORY_LIMIT = 50;

const VALID_SENDERS = new Set(['user', 'bot']);

// DT-906: limits on the extra fields so a client cannot store anything large.
const MAX_KEY_LENGTH = 200;
const MAX_BUTTONS = 5;
const BUTTON_FIELDS = ['labelKey', 'label', 'actionId', 'to', 'highlight'];

function isShortString(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= MAX_KEY_LENGTH;
}

// DT-906: keeps only known button fields, as short strings. Returns null when
// the value is not a usable list of buttons.
function cleanActionButtons(value) {
    if (!Array.isArray(value) || value.length > MAX_BUTTONS) return null;
    const cleaned = [];
    for (const button of value) {
        if (!button || typeof button !== 'object') return null;
        const kept = {};
        for (const field of BUTTON_FIELDS) {
            if (button[field] === undefined || button[field] === null) continue;
            if (!isShortString(button[field])) return null;
            kept[field] = button[field];
        }
        cleaned.push(kept);
    }
    return cleaned;
}

// GET /api/chatbot/history/:clientSessionId
async function getHistory(req, res, next) {
    try {
        const { clientSessionId } = req.params;

        const session = await prisma.chatSession.findUnique({
            where: { clientSessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: HISTORY_LIMIT,
                },
            },
        });

        if (!session) {
            return res.status(200).json({ messages: [] });
        }

        // Newest-first above so the cap keeps the most recent - flip back.
        return res.status(200).json({
            messages: session.messages.reverse(),
        });
    } catch (err) {
        return next(err);
    }
}

// POST /api/chatbot/history
async function appendMessage(req, res, next) {
    try {
        const { clientSessionId, sender, body, textKey, faqId, actionButtons } = req.body || {};

        if (typeof clientSessionId !== 'string' || clientSessionId.trim() === '') {
            return res.status(400).json({ error: 'clientSessionId is required.' });
        }
        if (!VALID_SENDERS.has(sender)) {
            return res.status(400).json({ error: "sender must be 'user' or 'bot'." });
        }
        if (typeof body !== 'string') {
            return res.status(400).json({ error: 'body must be a string.' });
        }
        // DT-906: optional fields that let a message be re-translated later.
        if (textKey !== undefined && textKey !== null && !isShortString(textKey)) {
            return res.status(400).json({ error: 'textKey must be a short string.' });
        }
        if (faqId !== undefined && faqId !== null && !isShortString(faqId)) {
            return res.status(400).json({ error: 'faqId must be a short string.' });
        }
        let buttons = null;
        if (actionButtons !== undefined && actionButtons !== null) {
            buttons = cleanActionButtons(actionButtons);
            if (buttons === null) {
                return res.status(400).json({ error: 'actionButtons is not valid.' });
            }
        }

        const session = await prisma.chatSession.upsert({
            where: { clientSessionId },
            update: {},
            create: { clientSessionId },
        });

        const message = await prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                sender,
                body,
                // DT-906
                textKey: textKey || null,
                faqId: faqId || null,
                actionButtons: buttons && buttons.length > 0 ? buttons : undefined,
            },
        });

        // Trim anything past the cap so a session cannot grow without bound.
        const stale = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' },
            skip: HISTORY_LIMIT,
            select: { id: true },
        });
        if (stale.length > 0) {
            await prisma.chatMessage.deleteMany({
                where: { id: { in: stale.map((m) => m.id) } },
            });
        }

        return res.status(201).json({ message });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getHistory, appendMessage, HISTORY_LIMIT };
