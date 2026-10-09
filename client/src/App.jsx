import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ChatbotWidget from './components/chatbot/app_imports/ChatbotWidget'
import AccessibilityPanel from './components/accessibility/AccessibilityPanel'
import './styles/global.css'
import './styles/responsive.css'

function App () {
  return (
    <Router>
      <div className='app'>
        <a className='skip-link' href='#main-content'>Skip to main content</a>
        <Navbar />
        <main id='main-content' tabIndex='-1'>
          <AppRoutes />
        </main>
        <Footer />
        <ChatbotWidget />
        <AccessibilityPanel />
      </div>
    </Router>
  )
}

export default App
