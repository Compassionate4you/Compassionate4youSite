import ChatbotWidget from './components/chatbot/app_imports/ChatbotWidget';
import HomeHealthPage from "./pages/HomeHealthPage";
//import AccessibilityPanel from './components/accessibility/AccessibilityPanel';

function App() {
    return (
        <div className="app">
            <ChatbotWidget/>
            <HomeHealthPage/>
        </div>
    );
}

export default App;