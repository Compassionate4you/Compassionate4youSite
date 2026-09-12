// Chatbot state hook (DT-332). Owns messages array and sendMessage flow.
// Tries client-side matcher first, falls back to backend.
import { useCallback, useRef, useState } from 'react';
import { matchIntent } from '../engine/matcher';
import { buildResponse } from '../engine/responseBuilder';
import { sendChatMessage } from '../../../services/api';

let nextId = 1;
function makeId() {
    nextId += 1;
    return `m_${Date.now()}_${nextId}`;
}

export function useChatbot() {
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const inFlightRef = useRef(false);

    const appendMessage = useCallback((msg) => {
        setMessages((prev) => [...prev, { id: makeId(), ...msg }]);
    }, []);

    const sendMessage = useCallback(
        async (rawText) => {
            const text = String(rawText || '').trim();
            if (!text || inFlightRef.current) return;

            appendMessage({ sender: 'user', text });

            const intent = matchIntent(text);
            const localReply = buildResponse(intent);
            if (localReply) {
                appendMessage({
                    sender: 'bot',
                    textKey: localReply.textKey,
                    actionButtons: localReply.actionButtons,
                });
                return;
            }

            inFlightRef.current = true;
            setIsSending(true);
            try {
                const reply = await sendChatMessage(text);
                appendMessage({
                    sender: 'bot',
                    text: reply?.text || '',
                    actionButtons: reply?.actionButtons || [],
                });
            } catch (err) {
                appendMessage({
                    sender: 'bot',
                    textKey: 'chatbot.responses.error',
                    actionButtons: [],
                });
                // eslint-disable-next-line no-console
                console.error('Chatbot send failed:', err);
            } finally {
                inFlightRef.current = false;
                setIsSending(false);
            }
        },
        [appendMessage]
    );

    return { messages, isSending, sendMessage };
}

export default useChatbot;
