// DT-808 Sprint 8
// Gandhar Tare
// Page highlighting after the chatbot sends the user somewhere: the DOM
// helpers, the hook that runs on navigation (including clearing), and the
// chat button that starts it.
import { useEffect, useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  FALLBACK_CLASS,
  HIGHLIGHT_NAME,
  applyRanges,
  clearHighlights,
  collectRanges,
  findPhraseRanges,
  findTargets,
  supportsHighlightApi,
  textRangesFor
} from '../engine/pageHighlighter'
import { usePageHighlight } from '../hooks/usePageHighlight'
import ActionButton from '../components/ActionButton'

vi.mock('../hooks/useAccessibilityBridge', () => ({
  useAccessibilityBridge: () => ({ runAction: vi.fn() })
}))

// Phrases the hook reads from the locale files. Other keys come back as-is,
// like the shared test translator.
const TEST_PHRASES = {
  'chatbot.highlightPhrases.hospiceOverview': ['rather than curing the illness', '24 hours a day']
}
vi.mock('react-i18next', () => {
  const t = (key) => TEST_PHRASES[key] ?? key
  return {
    useTranslation: () => ({
      t,
      i18n: { language: 'en', getFixedT: () => t, changeLanguage: () => Promise.resolve() }
    }),
    initReactI18next: { type: '3rdParty', init: () => {} }
  }
})

// jsdom has no CSS Highlight API. This stands in for it so both code paths
// can be tested.
function installHighlightApi () {
  const registry = new Map()
  globalThis.CSS = { highlights: registry }
  globalThis.Highlight = class {
    constructor (...ranges) { this.ranges = ranges }
  }
  return registry
}

function removeHighlightApi () {
  delete globalThis.CSS
  delete globalThis.Highlight
}

const highlighted = (registry) =>
  (registry.get(HIGHLIGHT_NAME)?.ranges || []).map((r) => r.toString())

beforeEach(() => {
  // jsdom does not implement scrolling.
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  clearHighlights()
  removeHighlightApi()
  document.body.innerHTML = ''
})

describe('findTargets', () => {
  it('returns matching elements in page order without duplicates', () => {
    document.body.innerHTML = `
      <section class="services-section"><article class="card"><h3 id="a">A</h3></article></section>
      <div class="specialty-text" id="b">B</div>
      <section class="services-section"><article class="card"><h3 id="c">C</h3></article></section>`

    const ids = findTargets(['.specialty-text', '.services-section .card h3', '#a']).map((el) => el.id)

    expect(ids).toEqual(['a', 'b', 'c'])
  })

  it('never returns anything inside the chat window', () => {
    document.body.innerHTML = `
      <h3 class="x" id="page">On the page</h3>
      <div class="chatbot-widget"><h3 class="x" id="chat">In the chat</h3></div>`

    expect(findTargets(['.x']).map((el) => el.id)).toEqual(['page'])
  })
})

describe('findPhraseRanges', () => {
  it('covers only the phrase, not the whole paragraph', () => {
    document.body.innerHTML =
      '<p>Hospice care focuses on comfort, rather than curing the illness. It is provided by a team.</p>'

    const ranges = findPhraseRanges(['rather than curing the illness'])

    expect(ranges.map((r) => r.toString())).toEqual(['rather than curing the illness'])
  })

  it('ignores case and finds every occurrence', () => {
    document.body.innerHTML = '<p>Emotional Support here.</p><p>More emotional support there.</p>'

    const ranges = findPhraseRanges(['emotional support'])

    expect(ranges.map((r) => r.toString())).toEqual(['Emotional Support', 'emotional support'])
  })

  it('skips text inside the chat window', () => {
    document.body.innerHTML = `
      <p>24 hours a day on the page</p>
      <div class="chatbot-widget"><p>24 hours a day in the chat</p></div>`

    expect(findPhraseRanges(['24 hours a day'])).toHaveLength(1)
  })

  it('returns nothing for phrases that are not on the page', () => {
    document.body.innerHTML = '<p>Something else</p>'
    expect(findPhraseRanges(['not here'])).toEqual([])
    expect(findPhraseRanges([])).toEqual([])
  })
})

describe('textRangesFor', () => {
  it('creates one range per non-blank piece of text', () => {
    document.body.innerHTML = `
      <ul class="hours"><li>Monday – Friday</li>
        <li>8:00 AM – 6:00 PM</li>   </ul>`

    const ranges = textRangesFor([document.querySelector('.hours')])

    expect(ranges.map((r) => r.toString())).toEqual(['Monday – Friday', '8:00 AM – 6:00 PM'])
  })
})

describe('collectRanges', () => {
  it('combines short elements and phrases, in page order', () => {
    document.body.innerHTML = `
      <p>Care that is about comfort rather than curing the illness.</p>
      <h3 class="title">Skilled Nurses</h3>`

    const ranges = collectRanges({ selectors: ['.title'], phrases: ['rather than curing the illness'] })

    expect(ranges.map((r) => r.toString())).toEqual(['rather than curing the illness', 'Skilled Nurses'])
  })
})

describe('applyRanges with the CSS Highlight API', () => {
  it('registers the ranges and leaves the DOM unchanged', () => {
    const registry = installHighlightApi()
    document.body.innerHTML = '<p>Keep comfort first, rather than curing the illness.</p>'
    const before = document.body.innerHTML

    const count = applyRanges(findPhraseRanges(['rather than curing the illness']))

    expect(supportsHighlightApi()).toBe(true)
    expect(count).toBe(1)
    expect(highlighted(registry)).toEqual(['rather than curing the illness'])
    expect(document.body.innerHTML).toBe(before)
  })

  it('clearHighlights removes them', () => {
    const registry = installHighlightApi()
    document.body.innerHTML = '<p>One</p>'

    applyRanges(findPhraseRanges(['One']))
    clearHighlights()

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
  })
})

describe('applyRanges without the API (fallback)', () => {
  it('outlines only the elements holding the text, and clearing removes it', () => {
    document.body.innerHTML = '<p id="x">rather than curing the illness</p><p id="y">Other</p>'

    applyRanges(findPhraseRanges(['rather than curing the illness']))

    expect(supportsHighlightApi()).toBe(false)
    expect(document.getElementById('x')).toHaveClass(FALLBACK_CLASS)
    expect(document.getElementById('y')).not.toHaveClass(FALLBACK_CLASS)

    clearHighlights()
    expect(document.getElementById('x')).not.toHaveClass(FALLBACK_CLASS)
  })
})

// --- The hook on real route changes --------------------------------------

// Renders what the widget renders: the "Clear highlights" button while
// highlights are showing.
function Highlighter () {
  const { isActive, clear } = usePageHighlight()
  return isActive ? <button onClick={clear}>chatbot.clearHighlights</button> : null
}

function HomeHealthStub () {
  const navigate = useNavigate()
  return (
    <main>
      <p className='hero-description'>Care at home</p>
      <section className='services-section'>
        <article className='card'>
          <h3 data-testid='nurse-title'>Skilled Nurses</h3>
          <p data-testid='nurse-text'>Collaborate with physicians.</p>
        </article>
      </section>
      <p className='specialty-text' data-testid='specialty'>Wound Care</p>
      <button onClick={() => navigate('/elsewhere')}>leave</button>
    </main>
  )
}

function HospiceStub () {
  return (
    <main>
      <p data-testid='card'>Hospice focuses on comfort rather than curing the illness, with a long explanation after it.</p>
      <p data-testid='benefits'>A phone line 24 hours a day for questions.</p>
    </main>
  )
}

function renderApp (initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Highlighter />
      <Routes>
        <Route path='/home-health' element={<HomeHealthStub />} />
        <Route path='/hospice' element={<HospiceStub />} />
        <Route path='/elsewhere' element={<p>Somewhere else</p>} />
      </Routes>
    </MemoryRouter>
  )
}

const clearButton = () => screen.queryByRole('button', { name: 'chatbot.clearHighlights' })

describe('usePageHighlight', () => {
  it('highlights the service names and specialties, not the card descriptions', () => {
    const registry = installHighlightApi()
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthServices' } })

    expect(highlighted(registry)).toEqual(['Skilled Nurses', 'Wound Care'])
    expect(highlighted(registry)).not.toContain('Collaborate with physicians.')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('highlights key phrases across every section of the page, not whole paragraphs', () => {
    const registry = installHighlightApi()
    renderApp({ pathname: '/hospice', state: { chatbotHighlight: 'hospiceOverview' } })

    expect(highlighted(registry)).toEqual(['rather than curing the illness', '24 hours a day'])
  })

  it('shows the clear button while highlights are on screen', () => {
    installHighlightApi()
    renderApp({ pathname: '/hospice', state: { chatbotHighlight: 'hospiceOverview' } })

    expect(clearButton()).toBeInTheDocument()
  })

  it('the clear button removes the highlights and hides itself', async () => {
    const user = userEvent.setup()
    const registry = installHighlightApi()
    renderApp({ pathname: '/hospice', state: { chatbotHighlight: 'hospiceOverview' } })

    await user.click(clearButton())

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
    expect(clearButton()).not.toBeInTheDocument()
    // Still on the same page.
    expect(screen.getByTestId('card')).toBeInTheDocument()
  })

  it('Esc removes the highlights', () => {
    const registry = installHighlightApi()
    renderApp({ pathname: '/hospice', state: { chatbotHighlight: 'hospiceOverview' } })

    act(() => { fireEvent.keyDown(window, { key: 'Escape' }) })

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
    expect(clearButton()).not.toBeInTheDocument()
  })

  it('does nothing on a normal visit', () => {
    const registry = installHighlightApi()
    renderApp({ pathname: '/home-health' })

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
    expect(clearButton()).not.toBeInTheDocument()
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('ignores an unknown highlight id', () => {
    const registry = installHighlightApi()
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'no-such-highlight' } })

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
  })

  it('clears the highlight when the user moves to another page', async () => {
    const user = userEvent.setup()
    const registry = installHighlightApi()
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthServices' } })
    expect(registry.has(HIGHLIGHT_NAME)).toBe(true)

    await user.click(screen.getByText('leave'))

    expect(screen.getByText('Somewhere else')).toBeInTheDocument()
    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
  })

  it('uses the outline fallback in browsers without the API', () => {
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthServices' } })

    expect(screen.getByTestId('nurse-title')).toHaveClass(FALLBACK_CLASS)
    expect(screen.getByTestId('nurse-text')).not.toHaveClass(FALLBACK_CLASS)
  })

  it('highlights cards that load after the page has rendered', async () => {
    const registry = installHighlightApi()
    // The service cards come from the database, so they appear later.
    function LateCards () {
      const [ready, setReady] = useState(false)
      useEffect(() => {
        const id = setTimeout(() => setReady(true), 20)
        return () => clearTimeout(id)
      }, [])
      return (
        <main>
          {ready && (
            <section className='services-section'>
              <article className='card'><h3 data-testid='late-card'>Speech Therapists</h3></article>
            </section>
          )}
        </main>
      )
    }

    render(
      <MemoryRouter initialEntries={[{ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthStaff' } }]}>
        <Highlighter />
        <Routes>
          <Route path='/home-health' element={<LateCards />} />
        </Routes>
      </MemoryRouter>
    )

    await screen.findByTestId('late-card')
    // The MutationObserver callback runs as a microtask after the insert.
    await act(async () => { await Promise.resolve() })
    expect(highlighted(registry)).toEqual(['Speech Therapists'])
  })
})

// --- The chat button --------------------------------------------------------

describe('ActionButton', () => {
  function LocationProbe () {
    return <Routes><Route path='*' element={<Probe />} /></Routes>
  }
  function Probe () {
    const { pathname, state } = useLocation()
    return <output data-testid='where'>{JSON.stringify({ pathname, state })}</output>
  }

  it('navigates and passes the highlight id in the router state', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <ActionButton labelKey='chatbot.faqLinks.homeHealth' actionId='navigate' to='/home-health' highlight='homeHealthServices' />
        <LocationProbe />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'chatbot.faqLinks.homeHealth' }))

    expect(JSON.parse(screen.getByTestId('where').textContent)).toEqual({
      pathname: '/home-health',
      state: { chatbotHighlight: 'homeHealthServices' }
    })
  })

  it('without a destination, highlights on the current page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/hospice']}>
        <ActionButton labelKey='chatbot.faqLinks.hours' actionId='navigate' highlight='officeHours' />
        <LocationProbe />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'chatbot.faqLinks.hours' }))

    expect(JSON.parse(screen.getByTestId('where').textContent)).toEqual({
      pathname: '/hospice',
      state: { chatbotHighlight: 'officeHours' }
    })
  })

  it('a plain page button navigates with no highlight state', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <ActionButton labelKey='chatbot.nav.hospice.button' actionId='navigate' to='/hospice' />
        <LocationProbe />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'chatbot.nav.hospice.button' }))

    expect(JSON.parse(screen.getByTestId('where').textContent)).toEqual({ pathname: '/hospice', state: null })
  })
})
