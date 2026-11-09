// DT-904 / DT-906 / DT-908 Sprint 9
// Gandhar Tare
// Earlier chat messages switch language when the language changes, and
// stay readable (not blank) after a page reload.
// Uses the real translation files and a real i18next instance.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import MessageBubble, { messageText } from '../components/MessageBubble'
import { useChatHistory } from '../hooks/useChatHistory'
import { loadHistory, saveMessage } from '../services/chatHistoryApi'

// The shared test setup replaces react-i18next with a key-returning stub.
// This file needs the real one to check actual translations.
vi.mock('react-i18next', async () => vi.importActual('react-i18next'))

vi.mock('../hooks/useAccessibilityBridge', () => ({
  useAccessibilityBridge: () => ({ runAction: vi.fn() })
}))

const here = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(here, '../../../locales')
const load = (lng) => JSON.parse(fs.readFileSync(path.join(localesDir, lng, 'translation.json'), 'utf8'))
const en = load('en')
const es = load('es')

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

afterEach(async () => {
  await act(async () => { await i18n.changeLanguage('en') })
  vi.restoreAllMocks()
})

function renderBubble (message) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <MessageBubble message={message} />
      </MemoryRouter>
    </I18nextProvider>
  )
}

const faqAnswer = (lang, id) => lang.chatbot.faq[id].answer
const faqQuestion = (lang, id) => lang.chatbot.faq[id].question

describe('earlier messages switch language (DT-904)', () => {
  it('a bot reply already in the chat changes to Spanish', async () => {
    renderBubble({ sender: 'bot', textKey: 'chatbot.faq.contact.answer' })
    expect(screen.getByText(i18n.t('chatbot.faq.contact.answer'))).toBeInTheDocument()

    await act(async () => { await i18n.changeLanguage('es') })

    expect(screen.getByText(i18n.getFixedT('es')('chatbot.faq.contact.answer'))).toBeInTheDocument()
  })

  it('its buttons change language too', async () => {
    renderBubble({
      sender: 'bot',
      textKey: 'chatbot.faq.services-offered.answer',
      actionButtons: [{ labelKey: 'chatbot.faqLinks.homeHealth', actionId: 'navigate', to: '/home-health' }]
    })

    await act(async () => { await i18n.changeLanguage('es') })

    expect(screen.getByRole('button', { name: es.chatbot.faqLinks.homeHealth })).toBeInTheDocument()
  })

  it('a question the user picked from the FAQ list changes language', async () => {
    renderBubble({
      sender: 'user',
      text: faqQuestion(en, 'contact'),
      faqId: 'contact'
    })
    expect(screen.getByText(faqQuestion(en, 'contact'))).toBeInTheDocument()

    await act(async () => { await i18n.changeLanguage('es') })

    expect(screen.getByText(faqQuestion(es, 'contact'))).toBeInTheDocument()
    expect(screen.queryByText(faqQuestion(en, 'contact'))).not.toBeInTheDocument()
  })

  it('a question the user typed stays exactly as typed', async () => {
    renderBubble({ sender: 'user', text: 'Do you have parking?' })

    await act(async () => { await i18n.changeLanguage('es') })

    expect(screen.getByText('Do you have parking?')).toBeInTheDocument()
  })

  it('falls back to the saved words if an FAQ id is no longer known', () => {
    const t = i18n.getFixedT('es')
    expect(messageText({ sender: 'user', text: 'Old question', faqId: 'removed-entry' }, t)).toBe('Old question')
  })

  it('the Spanish answer really is different from the English one', () => {
    expect(faqAnswer(es, 'contact')).not.toBe(faqAnswer(en, 'contact'))
  })
})

describe('saving messages (DT-906)', () => {
  it('sends the translation key, FAQ id and buttons with each message', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: {} })
    })
    const buttons = [{ labelKey: 'chatbot.faqLinks.contact', actionId: 'navigate', to: '/' }]

    await saveMessage('sess', { sender: 'bot', textKey: 'chatbot.faq.contact.answer', actionButtons: buttons })
    await saveMessage('sess', { sender: 'user', text: 'How do I contact you?', faqId: 'contact' })

    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body))
    expect(bodies[0]).toEqual({
      clientSessionId: 'sess',
      sender: 'bot',
      body: '',
      textKey: 'chatbot.faq.contact.answer',
      actionButtons: buttons
    })
    expect(bodies[1]).toEqual({
      clientSessionId: 'sess',
      sender: 'user',
      body: 'How do I contact you?',
      faqId: 'contact'
    })
  })

  it('a typed message sends only its words', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) })

    await saveMessage('sess', { sender: 'user', text: 'hola' })

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      clientSessionId: 'sess',
      sender: 'user',
      body: 'hola'
    })
  })
})

describe('after a page reload (DT-906)', () => {
  it('restored bot replies keep their key and buttons instead of coming back blank', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [
          { id: '1', sender: 'user', body: 'How do I contact you?', faqId: 'contact', textKey: null, actionButtons: null },
          { id: '2', sender: 'bot', body: '', textKey: 'chatbot.faq.contact.answer', faqId: null, actionButtons: [{ labelKey: 'chatbot.faqLinks.contact', actionId: 'navigate', to: '/' }] }
        ]
      })
    })

    const { result } = renderHook(() => useChatHistory())
    await waitFor(() => expect(result.current.isRestoring).toBe(false))

    const [question, reply] = result.current.restored
    expect(question).toMatchObject({ sender: 'user', faqId: 'contact' })
    expect(reply).toMatchObject({ sender: 'bot', textKey: 'chatbot.faq.contact.answer' })
    expect(reply.actionButtons).toHaveLength(1)
  })

  it('a restored reply shows real text, in the current language', async () => {
    await act(async () => { await i18n.changeLanguage('es') })
    renderBubble({ sender: 'bot', text: '', textKey: 'chatbot.faq.contact.answer', actionButtons: [] })

    const shown = document.querySelector('.chat-bubble__text').textContent
    expect(shown).not.toBe('')
    expect(shown).toBe(i18n.getFixedT('es')('chatbot.faq.contact.answer'))
  })

  it('older saved messages without keys still load as their words', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: '1', sender: 'user', body: 'hello' }] })
    })

    const messages = await loadHistory('sess')
    expect(messages).toEqual([{ id: '1', sender: 'user', body: 'hello' }])

    const { result } = renderHook(() => useChatHistory())
    await waitFor(() => expect(result.current.isRestoring).toBe(false))
    expect(result.current.restored[0]).toMatchObject({ text: 'hello', actionButtons: [] })
  })
})
