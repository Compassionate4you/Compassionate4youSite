import { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext(null);

const defaults = {
    textSize: 'default',
    theme: 'light',
    highContrast: false,
};

function readSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
        return { ...defaults, ...saved };
    } catch {
        return { ...defaults };
    }
}

export function AccessibilityProvider({ children }) {
    const [settings, setSettings] = useState(readSettings);

    useEffect(() => {
        const root = document.documentElement;

        // Preserve the site's existing text-size behavior:
        // default = 100%, large = 175%, extra-large = 250%.
        if (settings.textSize === 'default') {
            root.style.fontSize = '100%';
        } else if (settings.textSize === 'large') {
            root.style.fontSize = '175%';
        } else if (settings.textSize === 'extra-large') {
            root.style.fontSize = '250%';
        }

        root.setAttribute('theme', settings.theme);
        root.dataset.theme = settings.theme;
        root.classList.toggle('high-contrast', settings.highContrast);

        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }, [settings]);

    const value = {
        ...settings,
        setTextSize: (textSize) => setSettings((current) => ({ ...current, textSize })),
        setTheme: (theme) => setSettings((current) => ({ ...current, theme })),
        setHighContrast: (highContrast) => setSettings((current) => ({ ...current, highContrast })),
        resetAccessibility: () => setSettings({ ...defaults }),
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used inside AccessibilityProvider');
    }
    return context;
}
