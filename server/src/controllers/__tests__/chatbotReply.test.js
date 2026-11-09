// Gandhar Tare
// A chat message the chatbot could not match gets a "didn't understand"
// reply with a button that opens the Common questions list, not the old
// "coming soon" placeholder.

const request = require('supertest');
const express = require('express');

jest.mock('../../config/db', () => ({}));

const chatbotRoutes = require('../../routes/chatbotRoutes');

const app = express();
app.use(express.json());
app.use('/api/chatbot', chatbotRoutes);

const send = (body) => request(app).post('/api/chatbot/message').send(body);

describe('POST /api/chatbot/message', () => {
    test('replies with the "didn\'t understand" message as a translation key', async () => {
        const res = await send({ message: 'asdfgh' });

        expect(res.status).toBe(200);
        expect(res.body.reply.textKey).toBe('chatbot.responses.noMatch');
    });

    test('the reply has a button that opens Common questions', async () => {
        const res = await send({ message: 'asdfgh' });

        expect(res.body.reply.actionButtons).toEqual([
            { labelKey: 'chatbot.faqButton', actionId: 'openFaq' },
        ]);
    });

    test('no longer sends the "coming soon" placeholder', async () => {
        const res = await send({ message: 'asdfgh' });

        expect(res.body.reply.textKey).not.toBe('chatbot.responses.placeholder');
        expect(JSON.stringify(res.body)).not.toMatch(/coming soon/i);
    });

    test('an empty message is still rejected', async () => {
        const res = await send({ message: '   ' });

        expect(res.status).toBe(400);
    });

    test('a message that is not text is still rejected', async () => {
        const res = await send({ message: 42 });

        expect(res.status).toBe(400);
    });
});
