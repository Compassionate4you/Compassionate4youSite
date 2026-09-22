// Builds bot reply objects from matcher intents. Returns null for unknown
// intents (caller falls back to backend).
export function buildResponse(intent) {
    if (!intent) return null;

    if (intent.kind === 'accessibility') {
        return {
            textKey: intent.command.replyKey,
            actionButtons: [
                {
                    labelKey: intent.command.labelKey,
                    actionId: intent.actionId,
                },
            ],
        };
    }

    // DT-423: FAQ answers come straight from the question bank, plus an
    // optional link to the relevant page.
    if (intent.kind === 'faq') {
        const { entry } = intent;
        return {
            text: entry.answer,
            actionButtons: entry.link
                ? [
                      {
                          labelKey: entry.link.labelKey,
                          actionId: 'navigate',
                          to: entry.link.to,
                      },
                  ]
                : [],
        };
    }

    return null;
}

export default buildResponse;
