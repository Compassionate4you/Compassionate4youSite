// DT-396 / DT-398: chat history storage.
const { prisma } = require('../config/db');

// How many messages we keep per session.
const HISTORY_LIMIT = 50;

const VALID_SENDERS = new Set(['user', 'bot']);

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
        const { clientSessionId, sender, body } = req.body || {};

        if (typeof clientSessionId !== 'string' || clientSessionId.trim() === '') {
            return res.status(400).json({ error: 'clientSessionId is required.' });
        }
        if (!VALID_SENDERS.has(sender)) {
            return res.status(400).json({ error: "sender must be 'user' or 'bot'." });
        }
        if (typeof body !== 'string') {
            return res.status(400).json({ error: 'body must be a string.' });
        }

        const session = await prisma.chatSession.upsert({
            where: { clientSessionId },
            update: {},
            create: { clientSessionId },
        });

        const message = await prisma.chatMessage.create({
            data: { sessionId: session.id, sender, body },
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
