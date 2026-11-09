// DT-904 / DT-906 Sprint 9
// Gandhar Tare
// Tests for saving and loading chat history with the fields that let earlier
// messages switch language: textKey, faqId and actionButtons.
// Prisma is mocked, so no database is needed.

const request = require('supertest');
const express = require('express');

jest.mock('../../config/db', () => ({
    chatSession: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
    },
    chatMessage: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
    },
}));

const prisma = require('../../config/db');
const chatbotRoutes = require('../../routes/chatbotRoutes');

const app = express();
app.use(express.json());
app.use('/api/chatbot', chatbotRoutes);

beforeEach(() => {
    jest.clearAllMocks();
    prisma.chatSession.upsert.mockResolvedValue({ id: 'sess1' });
    prisma.chatMessage.create.mockImplementation(({ data }) => Promise.resolve({ id: 'm1', ...data }));
    prisma.chatMessage.findMany.mockResolvedValue([]);
});

const post = (body) => request(app).post('/api/chatbot/history').send(body);

describe('POST /api/chatbot/history', () => {
    test('saves a bot reply with its translation key and buttons', async () => {
        const buttons = [
            { labelKey: 'chatbot.faqLinks.homeHealth', actionId: 'navigate', to: '/home-health', highlight: 'homeHealthServices' },
        ];

        const res = await post({
            clientSessionId: 'abc',
            sender: 'bot',
            body: '',
            textKey: 'chatbot.faq.services-offered.answer',
            actionButtons: buttons,
        });

        expect(res.status).toBe(201);
        expect(prisma.chatMessage.create).toHaveBeenCalledWith({
            data: {
                sessionId: 'sess1',
                sender: 'bot',
                body: '',
                textKey: 'chatbot.faq.services-offered.answer',
                faqId: null,
                actionButtons: buttons,
            },
        });
    });

    test('saves a question picked from the FAQ list with its id', async () => {
        await post({
            clientSessionId: 'abc',
            sender: 'user',
            body: 'What services do you offer?',
            faqId: 'services-offered',
        });

        expect(prisma.chatMessage.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ sender: 'user', faqId: 'services-offered', textKey: null }),
        });
    });

    test('still accepts a plain typed message with no extra fields', async () => {
        const res = await post({ clientSessionId: 'abc', sender: 'user', body: 'hola' });

        expect(res.status).toBe(201);
        expect(prisma.chatMessage.create).toHaveBeenCalledWith({
            data: {
                sessionId: 'sess1',
                sender: 'user',
                body: 'hola',
                textKey: null,
                faqId: null,
                actionButtons: undefined,
            },
        });
    });

    test('drops button fields it does not know about', async () => {
        await post({
            clientSessionId: 'abc',
            sender: 'bot',
            body: '',
            textKey: 'chatbot.nav.hospice.reply',
            actionButtons: [{ labelKey: 'chatbot.nav.hospice.button', actionId: 'navigate', to: '/hospice', onclick: 'evil()' }],
        });

        const saved = prisma.chatMessage.create.mock.calls[0][0].data.actionButtons;
        expect(saved).toEqual([{ labelKey: 'chatbot.nav.hospice.button', actionId: 'navigate', to: '/hospice' }]);
    });

    test.each([
        ['a textKey that is not a string', { textKey: 42 }],
        ['a textKey that is too long', { textKey: 'k'.repeat(201) }],
        ['a faqId that is not a string', { faqId: {} }],
        ['buttons that are not a list', { actionButtons: 'nope' }],
        ['too many buttons', { actionButtons: Array(6).fill({ actionId: 'navigate' }) }],
        ['a button with a non-string field', { actionButtons: [{ to: 5 }] }],
    ])('rejects %s', async (_label, extra) => {
        const res = await post({ clientSessionId: 'abc', sender: 'bot', body: '', ...extra });

        expect(res.status).toBe(400);
        expect(prisma.chatMessage.create).not.toHaveBeenCalled();
    });
});

describe('GET /api/chatbot/history/:clientSessionId', () => {
    test('returns the saved keys so the client can translate old messages', async () => {
        prisma.chatSession.findUnique.mockResolvedValue({
            id: 'sess1',
            messages: [
                { id: '2', sender: 'bot', body: '', textKey: 'chatbot.faq.contact.answer', faqId: null, actionButtons: [{ labelKey: 'chatbot.faqLinks.contact', actionId: 'navigate', to: '/' }] },
                { id: '1', sender: 'user', body: 'How do I contact you?', textKey: null, faqId: 'contact', actionButtons: null },
            ],
        });

        const res = await request(app).get('/api/chatbot/history/abc');

        expect(res.status).toBe(200);
        // Oldest first.
        expect(res.body.messages[0]).toMatchObject({ sender: 'user', faqId: 'contact' });
        expect(res.body.messages[1]).toMatchObject({ sender: 'bot', textKey: 'chatbot.faq.contact.answer' });
        expect(res.body.messages[1].actionButtons).toHaveLength(1);
    });
});
