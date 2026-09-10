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

    return null;
}

export default buildResponse;
