// Chatbot routes (DT-332). Mounted at /api/chatbot in app.js.
const express = require('express');
const { sendMessage } = require('../controllers/chatbotController');

const router = express.Router();

// POST /api/chatbot/message
router.post('/message', sendMessage);

module.exports = router;
