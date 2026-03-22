import { useState } from 'react';
//import ChatWindow from '../components/ChatWindow';
import './ChatbotWidget.css';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="chatbot-widget">
            { /* This is the Floating Button */ }
            <button
                className="chatbot-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Open chat"
            >
                💬   
            </button>            

            { /* This is the Expanded Chat Window, which only shows when isOpen is true */}
            {/*isOpen && (
                <>
                    <ChatWindow onClose= {() => setIsOpen(false)} />
                </>
            )*/}
        </div>
    );
}
