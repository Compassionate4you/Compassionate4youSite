// Intent matcher. Currently only handles accessibility commands (DT-335).
// Returns an intent object or null (null = send to backend).
import { accessibilityCommands } from '../data/accessibilityCommands';

function normalize(text) {
    return String(text || '').toLowerCase().trim();
}

export function matchIntent(message) {
    const text = normalize(message);
    if (!text) return null;

    for (const command of accessibilityCommands) {
        for (const trigger of command.triggers) {
            if (text.includes(trigger.toLowerCase())) {
                return {
                    kind: 'accessibility',
                    actionId: command.actionId,
                    command,
                };
            }
        }
    }

    return null;
}

export default matchIntent;
