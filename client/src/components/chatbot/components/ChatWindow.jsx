import ChatInput from './ChatInput';
import './styles/ChatWindow.css';

function ChatWindow({ onClose }) {
    return (
        <div className="chat-window">
            <div className="chat-header">
                <span>Compassionate4you Chat</span>
                <button onClick={onClose}>-</button>
            </div>
            <div className="chat-body">
            </div>
            <ChatInput />
        </div>
    );
}

export default ChatWindow;
