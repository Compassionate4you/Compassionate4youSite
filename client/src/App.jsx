import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ChatbotWidget from "./components/chatbot/app_imports/ChatbotWidget";
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";

function App() {
    return (
        <Router>
            <div className="app">
                <Navbar /> 
                <AppRoutes />
                <Footer />
                <ChatbotWidget />
                <AccessibilityPanel />
            </div>
        </Router>
    );
}

export default App;