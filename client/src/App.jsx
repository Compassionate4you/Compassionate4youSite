import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatbotWidget from "./components/chatbot/app_imports/ChatbotWidget";
import AdminDashboard from "./pages/AdminDashboard";
// import AccessibilityPanel from './components/accessibility/AccessibilityPanel';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<div></div>} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;