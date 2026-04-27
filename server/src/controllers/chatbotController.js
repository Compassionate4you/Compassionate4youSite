// Chatbot message handler (DT-332 / DT-334).
// Returns a placeholder response while the engine is being built.

function sendMessage(req, res) {
    const { message } = req.body || {};

    if (typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({
            error: 'Message is required and must be a non-empty string.',
        });
    }

    return res.status(200).json({
        reply: {
            text: 'Got your message. Full chatbot responses coming soon.',
            actionButtons: [],
        },
    });
}

module.exports = { sendMessage };
