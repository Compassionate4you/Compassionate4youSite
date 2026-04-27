// DT-335: chatbot accessibility bridge. Writes CSS vars + classes to
// document.documentElement so the panel can later read the same state.
import { useCallback } from 'react';

const TEXT_SCALE_STEP = 0.1;
const TEXT_SCALE_MIN = 0.8;
const TEXT_SCALE_MAX = 1.6;

function getCurrentTextScale() {
    const root = document.documentElement;
    const raw = getComputedStyle(root).getPropertyValue('--text-scale').trim();
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function setTextScale(next) {
    const clamped = Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, next));
    document.documentElement.style.setProperty(
        '--text-scale',
        clamped.toFixed(2)
    );
}

export function useAccessibilityBridge() {
    const increaseTextSize = useCallback(() => {
        setTextScale(getCurrentTextScale() + TEXT_SCALE_STEP);
    }, []);

    const decreaseTextSize = useCallback(() => {
        setTextScale(getCurrentTextScale() - TEXT_SCALE_STEP);
    }, []);

    const toggleDarkMode = useCallback(() => {
        const root = document.documentElement;
        const current = root.getAttribute('data-theme');
        root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    }, []);

    const toggleLightMode = useCallback(() => {
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    const toggleHighContrast = useCallback(() => {
        document.documentElement.classList.toggle('high-contrast');
    }, []);

    const runAction = useCallback(
        (actionId) => {
            const actions = {
                increaseTextSize,
                decreaseTextSize,
                toggleDarkMode,
                toggleLightMode,
                toggleHighContrast,
            };
            const fn = actions[actionId];
            if (typeof fn === 'function') fn();
        },
        [
            increaseTextSize,
            decreaseTextSize,
            toggleDarkMode,
            toggleLightMode,
            toggleHighContrast,
        ]
    );

    return {
        increaseTextSize,
        decreaseTextSize,
        toggleDarkMode,
        toggleLightMode,
        toggleHighContrast,
        runAction,
    };
}

export default useAccessibilityBridge;
