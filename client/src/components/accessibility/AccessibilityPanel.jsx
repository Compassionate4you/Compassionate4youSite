import { useState } from 'react';
import './styles/accessibility.css';

function AccessibilityPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [textSize, setTextSize] = useState('default');
    const [theme, setTheme] = useState('light');
    const [contrastOn, setContrastOn] = useState(false);
    const [language, setLanguage] = useState('en');

    return (
        <>
            {/* Toggle Button */}
            <button className="a11y-toggle" onClick={() => setIsOpen(true)} aria-label="Open accessibility settings">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
                Accessibility Tools
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="a11y-overlay" style={{ display: 'block' }} onClick={() => setIsOpen(false)} />
            )}

            {/* Panel */}
            <div className={`a11y-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Accessibility settings">

                <div className="panel-header">
                    <h2>Accessibility</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close accessibility panel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Text Size */}
                <div className="section">
                    <div className="section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                        </svg>
                        Text Size
                    </div>
                    <div className="btn-group">
                        <button className={`opt-btn ${textSize === 'default' ? 'active' : ''}`} onClick={() => setTextSize('default')}>Default</button>
                        <button className={`opt-btn ${textSize === 'large' ? 'active' : ''}`} style={{ fontSize: '16px' }} onClick={() => setTextSize('large')}>Large</button>
                        <button className={`opt-btn ${textSize === 'extra-large' ? 'active' : ''}`} style={{ fontSize: '18px' }} onClick={() => setTextSize('extra-large')}>Extra Large</button>
                    </div>
                </div>

                {/* Theme */}
                <div className="section">
                    <div className="section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        Theme
                    </div>
                    <div className="btn-group row">
                        <button className={`opt-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                            Light
                        </button>
                        <button className={`opt-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                            Dark
                        </button>
                    </div>
                </div>

                {/* High Contrast */}
                <div className="section">
                    <div className="section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor"/>
                        </svg>
                        High Contrast
                    </div>
                    <button className={`opt-btn full-width ${contrastOn ? 'active' : ''}`} onClick={() => setContrastOn(!contrastOn)}>
                        {contrastOn ? 'Enabled' : 'Disabled'}
                    </button>
                </div>

                {/* Language */}
                <div className="section">
                    <div className="section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        Language
                    </div>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Select language">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>

                <div className="notice">
                    This site is optimized for screen readers. Press Tab to navigate through interactive elements.
                </div>

                <button className="ai-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    AI Help Assistant
                </button>

            </div>
        </>
    );
}

export default AccessibilityPanel;
