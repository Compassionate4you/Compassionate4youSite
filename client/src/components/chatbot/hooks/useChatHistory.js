// DT-398: chat history persistence.
//
// Every browser gets a session id stored in localStorage, so history survives
// a page reload or closing the site. Messages are mirrored to the backend and
// reloaded on mount. If the backend is unreachable the chat still works - it
// just falls back to whatever is held in memory for this visit.
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadHistory, saveMessage } from '../services/chatHistoryApi';

const SESSION_KEY = 'c4y.chat.sessionId';

// Matches the server-side cap so both ends agree on "last X messages".
export const HISTORY_LIMIT = 50;

function readStoredSessionId() {
    try {
        return window.localStorage.getItem(SESSION_KEY);
    } catch {
        return null;
    }
}

function writeStoredSessionId(id) {
    try {
        window.localStorage.setItem(SESSION_KEY, id);
    } catch {
        // Private browsing or blocked storage - stay in memory for this visit.
    }
}

function createSessionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `s_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useChatHistory() {
    const sessionIdRef = useRef(null);
    if (sessionIdRef.current === null) {
        const existing = readStoredSessionId();
        const id = existing || createSessionId();
        if (!existing) writeStoredSessionId(id);
        sessionIdRef.current = id;
    }

    const [restored, setRestored] = useState([]);
    const [isRestoring, setIsRestoring] = useState(true);

    useEffect(() => {
        let cancelled = false;

        loadHistory(sessionIdRef.current)
            .then((messages) => {
                if (cancelled) return;
                setRestored(
                    messages.map((m, i) => ({
                        id: `restored_${i}_${m.id || i}`,
                        sender: m.sender,
                        text: m.body || '',
                        actionButtons: [],
                    }))
                );
            })
            .catch(() => {
                // No stored history available - start fresh.
            })
            .finally(() => {
                if (!cancelled) setIsRestoring(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const persist = useCallback((message) => {
        return saveMessage(sessionIdRef.current, message).catch(() => {
            // Keep the conversation usable even if persistence fails.
        });
    }, []);

    return {
        sessionId: sessionIdRef.current,
        restored,
        isRestoring,
        persist,
    };
}

export default useChatHistory;
