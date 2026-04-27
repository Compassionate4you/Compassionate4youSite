// Scrollable list of message bubbles. Auto-scrolls to bottom on new messages.
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

function MessageList({ messages }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    return (
        <div className="chat-messages" role="log" aria-live="polite">
            {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;
