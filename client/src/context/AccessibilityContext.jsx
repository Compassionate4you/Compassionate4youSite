import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AccessibilityContext = createContext(null);

const defaults = {
  textSize: 'default',
  theme: 'light',
  highContrast: false,
};

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('accessibilitySettings'));
    return { ...defaults, ...(saved || {}) };
  } catch {
    return { ...defaults };
  }
}

const TEXT_SCALE = {
  default: '1',
  large: '1.2',
  'extra-large': '1.4',
};

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.setAttribute('theme', settings.theme);
    root.dataset.textSize = settings.textSize;
    root.style.setProperty('--text-scale', TEXT_SCALE[settings.textSize] || '1');
    root.classList.toggle('high-contrast', settings.highContrast);
  }, [settings]);

  const value = useMemo(() => ({
    ...settings,
    setTextSize: (textSize) => setSettings((s) => ({ ...s, textSize })),
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    setHighContrast: (highContrast) => setSettings((s) => ({ ...s, highContrast })),
    resetAccessibility: () => setSettings({ ...defaults }),
  }), [settings]);

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
