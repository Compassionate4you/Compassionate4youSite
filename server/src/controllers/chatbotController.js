// Chatbot message handler (DT-332 / DT-334).
// The chatbot answers greetings, common questions, page requests and
// accessibility commands in the browser. Anything it could not match is
// sent here, and the reply says it did not understand and offers the
// "Common questions" list.

function sendMessage(req, res) {
    const { message } = req.body || {};

    if (typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({
            error: 'Message is required and must be a non-empty string.',
        });
    }

    return res.status(200).json({
        reply: {
            // A translation key rather than text, so the reply follows the
            // site's language like the rest of the chatbot.
            textKey: 'chatbot.responses.noMatch',
            // Opens the "Common questions" list in the chat window.
            actionButtons: [{ labelKey: 'chatbot.faqButton', actionId: 'openFaq' }],
        },
    });
}

module.exports = { sendMessage };
