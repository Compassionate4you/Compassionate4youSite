// Chatbot routes (DT-332). Mounted at /api/chatbot in app.js.
const express = require('express');
const { sendMessage } = require('../controllers/chatbotController');
const {
    getHistory,
    appendMessage,
} = require('../controllers/chatHistoryController');

const router = express.Router();

// POST /api/chatbot/message
router.post('/message', sendMessage);

// DT-396: chat history.
router.get('/history/:clientSessionId', getHistory);
router.post('/history', appendMessage);

module.exports = router;
