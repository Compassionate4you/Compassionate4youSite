import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../components/ChatWindow';
import { useChatbot } from '../hooks/useChatbot';
import './styles/ChatbotWidget.css';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

  // DT-392: chat state lives here, not in ChatWindow. ChatWindow unmounts
  // when the window is closed, so keeping it there wiped the conversation.
  const chat = useChatbot()

    return (
        <div className="chatbot-widget">
            { /* This is the Floating Button */ }
            {!isOpen && (
                <button
                    className="chatbot-toggle-btn"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    title={t("chatbot.title")}
                    aria-label={t("chatbot.open", "Open chat")}
                    aria-expanded={isOpen}
                >
                    💬
                </button>
            )}

      {/* This is the Expanded Chat Window, which only shows when isOpen is true */}
      {isOpen && (
        <>
          <ChatWindow
            onClose={() => setIsOpen(false)}
            messages={chat.messages}
            isSending={chat.isSending}
            sendMessage={chat.sendMessage}
          />
        </>
      )}
    </div>
  )
}
