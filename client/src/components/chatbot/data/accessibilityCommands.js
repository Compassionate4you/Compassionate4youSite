// DT-335: phrases that trigger accessibility action buttons in the chatbot.
export const accessibilityCommands = [
    {
        actionId: 'increaseTextSize',
        labelKey: 'chatbot.actions.increaseTextSize',
        replyKey: 'chatbot.responses.increaseTextSize',
        triggers: [
            'bigger text',
            'larger text',
            'increase text',
            'increase font',
            'make text bigger',
            'make text larger',
            'make font bigger',
            'text too small',
            'text is too small',
            'hard to read',
            'cant read',
            "can't read",
        ],
    },
    {
        actionId: 'decreaseTextSize',
        labelKey: 'chatbot.actions.decreaseTextSize',
        replyKey: 'chatbot.responses.decreaseTextSize',
        triggers: [
            'smaller text',
            'decrease text',
            'decrease font',
            'make text smaller',
            'make font smaller',
            'text too big',
            'text is too big',
        ],
    },
    {
        actionId: 'toggleDarkMode',
        labelKey: 'chatbot.actions.toggleDarkMode',
        replyKey: 'chatbot.responses.toggleDarkMode',
        triggers: [
            'dark mode',
            'dark theme',
            'night mode',
            'turn off the lights',
            'too bright',
            'switch to dark',
        ],
    },
    {
        actionId: 'toggleLightMode',
        labelKey: 'chatbot.actions.toggleLightMode',
        replyKey: 'chatbot.responses.toggleLightMode',
        triggers: [
            'light mode',
            'light theme',
            'switch to light',
            'too dark',
        ],
    },
    {
        actionId: 'toggleHighContrast',
        labelKey: 'chatbot.actions.toggleHighContrast',
        replyKey: 'chatbot.responses.toggleHighContrast',
        triggers: [
            'high contrast',
            'higher contrast',
            'more contrast',
            'hard to see',
        ],
    },
];

export default accessibilityCommands;
