// Gandhar Tare
// The chatbot says hello back to greetings like "hi", and when it does not
// understand a message it says so and offers the "Common questions" list,
// instead of the old "Got your message. Full chatbot responses coming soon."
// Uses the real translation files; the server request is mocked.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import ChatWindow from '../components/ChatWindow'
import { useChatbot } from '../hooks/useChatbot'
import { isGreeting, matchIntent } from '../engine/matcher'
import { buildResponse } from '../engine/responseBuilder'
import { messageText } from '../components/MessageBubble'
import { sendChatMessage } from '../../../services/api'

vi.mock('react-i18next', async () => vi.importActual('react-i18next'))

vi.mock('../hooks/useAccessibilityBridge', () => ({
  useAccessibilityBridge: () => ({ runAction: vi.fn() })
}))

vi.mock('../services/chatHistoryApi', () => ({
  loadHistory: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../../services/api', () => ({
  sendChatMessage: vi.fn()
}))

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(here, '../../../locales')
const load = (lng) => JSON.parse(fs.readFileSync(path.join(localesDir, lng, 'translation.json'), 'utf8'))
const en = load('en')
const es = load('es')

// What the server sends back for a message the chatbot could not match.
const SERVER_NO_MATCH = {
  textKey: 'chatbot.responses.noMatch',
  actionButtons: [{ labelKey: 'chatbot.faqButton', actionId: 'openFaq' }]
}

let i18n

beforeAll(async () => {
  i18n = i18next.createInstance()
  await i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, es: { translation: es } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    showSupportNotice: false
  })
})

beforeEach(() => {
  // The test browser cannot scroll; the message list scrolls to the newest one.
  Element.prototype.scrollIntoView = vi.fn()
  sendChatMessage.mockResolvedValue(SERVER_NO_MATCH)
})

afterEach(async () => {
  await act(async () => { await i18n.changeLanguage('en') })
  vi.clearAllMocks()
})

// The chat window with the real message flow, as the widget uses it.
function Chat () {
  const { messages, isSending, sendMessage } = useChatbot()
  return <ChatWindow onClose={() => {}} messages={messages} isSending={isSending} sendMessage={sendMessage} />
}

function renderChat () {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <Chat />
      </MemoryRouter>
    </I18nextProvider>
  )
}

async function send (user, text) {
  await user.type(screen.getByRole('textbox'), text)
  await user.keyboard('{Enter}')
}

describe('which messages count as a greeting', () => {
  it.each([
    'hi', 'Hi', 'HI!', 'hello', 'hey', 'hiya', 'yo', 'good morning', 'Good evening!',
    'hi there', 'hello everyone', 'hey bot', 'hi, how are you?', "what's up", 'hello 👋',
    'hola', 'Buenos días', 'namaste', 'नमस्ते', 'sat sri akal', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'
  ])('"%s" is a greeting', (text) => {
    expect(isGreeting(text)).toBe(true)
  })

  it.each([
    'hi, what are your hours?',
    'hello I want to schedule an appointment',
    'this is a test',
    'history',
    'high contrast',
    'there',
    ''
  ])('"%s" is not just a greeting', (text) => {
    expect(isGreeting(text)).toBe(false)
  })

  it('a greeting with a real question still gets the question answered', () => {
    const intent = matchIntent('hi, what are your hours?')
    expect(intent?.kind).not.toBe('greeting')
    expect(intent).not.toBeNull()
  })

  it('the greeting reply has a hello and a Common questions button', () => {
    expect(buildResponse(matchIntent('hi'))).toEqual({
      textKey: 'chatbot.responses.greeting',
      actionButtons: [{ labelKey: 'chatbot.faqButton', actionId: 'openFaq' }]
    })
  })
})

describe('in the chat window', () => {
  it('"hi" gets a hello back, without asking the server', async () => {
    const user = userEvent.setup()
    renderChat()

    await send(user, 'hi')

    expect(await screen.findByText(en.chatbot.responses.greeting)).toBeInTheDocument()
    expect(sendChatMessage).not.toHaveBeenCalled()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('a message it does not understand says so (no more "coming soon")', async () => {
    const user = userEvent.setup()
    renderChat()

    await send(user, 'asdfgh')

    expect(await screen.findByText(en.chatbot.responses.noMatch)).toBeInTheDocument()
    expect(sendChatMessage).toHaveBeenCalledWith('asdfgh')
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('the reply\'s Common questions button opens the question list', async () => {
    const user = userEvent.setup()
    renderChat()

    await send(user, 'asdfgh')
    await screen.findByText(en.chatbot.responses.noMatch)
    expect(screen.queryByText(en.chatbot.faqIntro)).not.toBeInTheDocument()

    // The first "Common questions" button is the one inside the reply; the
    // other is the usual toggle under the messages.
    const [replyButton] = screen.getAllByRole('button', { name: en.chatbot.faqButton })
    expect(replyButton).toHaveClass('chat-action-btn')
    await user.click(replyButton)

    expect(screen.getByText(en.chatbot.faqIntro)).toBeInTheDocument()
  })

  it('picking a question from the opened list answers it', async () => {
    const user = userEvent.setup()
    renderChat()

    await send(user, 'hi')
    await screen.findByText(en.chatbot.responses.greeting)
    await user.click(screen.getAllByRole('button', { name: en.chatbot.faqButton })[0])

    const firstQuestion = screen.getAllByRole('listitem')[0].querySelector('button')
    await user.click(firstQuestion)

    await waitFor(() => expect(screen.queryByText(en.chatbot.faqIntro)).not.toBeInTheDocument())
    expect(sendChatMessage).not.toHaveBeenCalled()
  })

  it('both replies change language with the site', async () => {
    const user = userEvent.setup()
    renderChat()

    await send(user, 'hi')
    await screen.findByText(en.chatbot.responses.greeting)
    await send(user, 'asdfgh')
    await screen.findByText(en.chatbot.responses.noMatch)

    await act(async () => { await i18n.changeLanguage('es') })

    expect(screen.getByText(es.chatbot.responses.greeting)).toBeInTheDocument()
    expect(screen.getByText(es.chatbot.responses.noMatch)).toBeInTheDocument()
  })
})

describe('chats saved before this change', () => {
  it('an old "coming soon" reply now shows the "didn\'t understand" message', () => {
    const t = i18n.getFixedT('en')
    expect(messageText({ sender: 'bot', textKey: 'chatbot.responses.placeholder' }, t))
      .toBe(en.chatbot.responses.noMatch)
  })
})
