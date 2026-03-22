# Chatbot Module

## Directory Structure

### `/app imports`

Entry point for the chatbot. Contains `ChatbotWidget.jsx`, which is the root component that renders the floating chat button and manages the expanded/minimized state. This is what gets imported by the rest of the app.

### `/components`

Pure UI components — these handle how things look, not how things work.

- **ChatWindow.jsx** — The expanded chat container/frame

- **MessageList.jsx** — Scrollable area that renders all messages

- **MessageBubble.jsx** — A single message bubble (user or bot), handles styling based on sender

- **ActionButton.jsx** — Clickable buttons inside bot responses (e.g. "Go to Scheduling", "Enable Large Text")

- **ChatInput.jsx** — Text input field and send button

- **HistoryPanel.jsx** — List of past chat sessions, only shown for logged-in users

### `/data`

The chatbot's knowledge base. All pre-written content lives here. No logic — just data.

- **companyInfo.js** — Company philosophy, services, about text, and all other site content the bot can reference

- **faq.js** — Pre-written question and answer pairs

- **navigation.js** — Maps topics to routes and section anchors (e.g. "scheduling" → "/schedule", "home health services" → "/home-health#services")

- **accessibilityCommands.js** — Phrases that trigger accessibility actions (e.g. "make text bigger" → increase text size, "switch to dark mode" → toggle dark theme)

### `/engine`

The chatbot's brain. Takes user input, figures out what they're asking, and builds a response.

- **matcher.js** — Keyword and intent matching logic. Takes a user message and determines which topic/FAQ/command it maps to

- **responseBuilder.js** — Assembles the bot's response object: text + optional action buttons + optional page links

- **contentFilter.js** — Scans outgoing responses and blocks any protected health information (PHI) from appearing in chat

### `/hooks`

React hooks that manage state and connect the chatbot to the rest of the app.

- **useChatbot.js** — Core chat state: messages array, send/receive functions, handles the flow from user input → matcher → responseBuilder → new message

- **useChatHistory.js** — Handles chat persistence. Uses session storage for guests and API calls for logged-in users

- **useAccessibilityBridge.js** — Reads the site's current accessibility settings and exposes functions to toggle them from within the chat

### `/services`

API calls to the backend.

- **chatHistoryApi.js** — Save and load chat history for logged-in users (talks to the Express backend)

### `index.js`

Public export file. The rest of the app only imports from here.