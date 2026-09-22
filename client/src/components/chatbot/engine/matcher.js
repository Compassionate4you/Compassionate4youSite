// Intent matcher. Handles accessibility commands (DT-335) and the FAQ
// question bank (DT-423). Returns an intent object or null (null = send to
// backend).
import { accessibilityCommands } from '../data/accessibilityCommands';
import { faq } from '../data/faq';

function normalize(text) {
    return String(text || '').toLowerCase().trim();
}

function matchAccessibility(text) {
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

// DT-423: score each entry by how many of its keywords appear in the message.
// Longer keywords win ties so 'home health vs' beats a bare 'health'.
function matchFaq(text) {
    let best = null;
    let bestScore = 0;

    for (const entry of faq) {
        let score = 0;
        for (const keyword of entry.keywords) {
            const k = keyword.toLowerCase();
            if (text.includes(k)) score += k.length;
        }
        if (score > bestScore) {
            best = entry;
            bestScore = score;
        }
    }

    return best ? { kind: 'faq', entry: best } : null;
}

export function matchIntent(message) {
    const text = normalize(message);
    if (!text) return null;

    // Accessibility commands take priority - they are direct instructions.
    return matchAccessibility(text) || matchFaq(text);
}

// DT-420: used by the FAQ button to look an entry up directly.
export function getFaqById(id) {
    return faq.find((entry) => entry.id === id) || null;
}

export default matchIntent;
