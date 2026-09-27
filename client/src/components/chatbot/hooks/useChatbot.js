// Chatbot state hook (DT-332). Owns messages array and sendMessage flow.
// Tries client-side matcher first, falls back to backend.
// DT-398: messages are mirrored to the backend so history survives a reload.
import { useCallback, useEffect, useRef, useState } from 'react';
import { matchIntent } from '../engine/matcher';
import { buildResponse } from '../engine/responseBuilder';
import { sendChatMessage } from '../../../services/api';
import { useChatHistory } from './useChatHistory';

let nextId = 1;
function makeId() {
    nextId += 1;
    return `m_${Date.now()}_${nextId}`;
}

export function useChatbot() {
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const inFlightRef = useRef(false);

    const { restored, isRestoring, persist } = useChatHistory();

    // Drop restored history in front of anything sent during this visit.
    useEffect(() => {
        if (isRestoring || restored.length === 0) return;
        setMessages((prev) => [...restored, ...prev]);
    }, [isRestoring, restored]);

    const appendMessage = useCallback(
        (msg) => {
            const full = { id: makeId(), ...msg };
            setMessages((prev) => [...prev, full]);
            persist(full);
            return full;
        },
        [persist]
    );

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
                    text: localReply.text,
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
