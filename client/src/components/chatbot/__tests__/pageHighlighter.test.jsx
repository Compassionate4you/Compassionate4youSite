// DT-808 Sprint 8
// Gandhar Tare
// Page highlighting after the chatbot sends the user somewhere: the DOM
// helpers, the hook that runs on navigation, and the chat button that starts
// it.
import { useEffect, useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  FALLBACK_CLASS,
  HIGHLIGHT_NAME,
  applyHighlights,
  clearHighlights,
  findTargets,
  supportsHighlightApi,
  textRangesFor
} from '../engine/pageHighlighter'
import { usePageHighlight } from '../hooks/usePageHighlight'
import ActionButton from '../components/ActionButton'

vi.mock('../hooks/useAccessibilityBridge', () => ({
  useAccessibilityBridge: () => ({ runAction: vi.fn() })
}))

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
      <section class="services-section"><article class="card" id="a">A</article></section>
      <div class="specialty-card" id="b">B</div>
      <section class="services-section"><article class="card" id="c">C</article></section>`

    const ids = findTargets(['.specialty-card', '.services-section .card', '#a']).map((el) => el.id)

    expect(ids).toEqual(['a', 'b', 'c'])
  })

  it('returns nothing when no selectors match', () => {
    document.body.innerHTML = '<p>nothing here</p>'
    expect(findTargets(['.services-section .card'])).toEqual([])
    expect(findTargets([])).toEqual([])
  })
})

describe('textRangesFor', () => {
  it('creates one range per non-blank piece of text', () => {
    document.body.innerHTML = `
      <article class="card"><h3>Skilled Nurses</h3>
        <p>Medical care at home</p>   </article>`

    const ranges = textRangesFor([document.querySelector('.card')])

    expect(ranges.map((r) => r.toString())).toEqual(['Skilled Nurses', 'Medical care at home'])
  })
})

describe('applyHighlights with the CSS Highlight API', () => {
  it('registers the text of every target and leaves the DOM unchanged', () => {
    const registry = installHighlightApi()
    document.body.innerHTML = '<div class="t">One</div><div class="t">Two</div>'
    const before = document.body.innerHTML

    const count = applyHighlights(findTargets(['.t']))

    expect(supportsHighlightApi()).toBe(true)
    expect(count).toBe(2)
    expect(registry.get(HIGHLIGHT_NAME).ranges.map((r) => r.toString())).toEqual(['One', 'Two'])
    expect(document.body.innerHTML).toBe(before)
  })

  it('clearHighlights removes them', () => {
    const registry = installHighlightApi()
    document.body.innerHTML = '<div class="t">One</div>'

    applyHighlights(findTargets(['.t']))
    clearHighlights()

    expect(registry.has(HIGHLIGHT_NAME)).toBe(false)
  })
})

describe('applyHighlights without the API (fallback)', () => {
  it('outlines the targets with a class, and clearing removes it', () => {
    document.body.innerHTML = '<div class="t" id="x">One</div><div id="y">Other</div>'

    applyHighlights(findTargets(['.t']))

    expect(supportsHighlightApi()).toBe(false)
    expect(document.getElementById('x')).toHaveClass(FALLBACK_CLASS)
    expect(document.getElementById('y')).not.toHaveClass(FALLBACK_CLASS)

    clearHighlights()
    expect(document.getElementById('x')).not.toHaveClass(FALLBACK_CLASS)
  })
})

// --- The hook on real route changes --------------------------------------

function Highlighter () {
  usePageHighlight()
  return null
}

function HomeHealthStub () {
  return (
    <main>
      <p className='hero-description'>Care at home</p>
      <section className='services-section'>
        <article className='card' data-testid='nurse-card'>Skilled Nurses</article>
      </section>
      <div className='specialty-card' data-testid='specialty'>Wound Care</div>
    </main>
  )
}

function OtherPage () {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/elsewhere')}>leave</button>
}

function renderApp (initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Highlighter />
      <Routes>
        <Route path='/home-health' element={<><HomeHealthStub /><OtherPage /></>} />
        <Route path='/elsewhere' element={<p>Somewhere else</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('usePageHighlight', () => {
  it('highlights the services when the chatbot asked for it', () => {
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthServices' } })

    expect(screen.getByTestId('nurse-card')).toHaveClass(FALLBACK_CLASS)
    expect(screen.getByTestId('specialty')).toHaveClass(FALLBACK_CLASS)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('does nothing on a normal visit', () => {
    renderApp({ pathname: '/home-health' })

    expect(screen.getByTestId('nurse-card')).not.toHaveClass(FALLBACK_CLASS)
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('ignores an unknown highlight id', () => {
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'no-such-highlight' } })

    expect(screen.getByTestId('nurse-card')).not.toHaveClass(FALLBACK_CLASS)
  })

  it('clears the highlight when the user moves to another page', async () => {
    const user = userEvent.setup()
    renderApp({ pathname: '/home-health', state: { chatbotHighlight: 'homeHealthServices' } })
    const card = screen.getByTestId('nurse-card')
    expect(card).toHaveClass(FALLBACK_CLASS)

    await user.click(screen.getByText('leave'))

    expect(screen.getByText('Somewhere else')).toBeInTheDocument()
    expect(card).not.toHaveClass(FALLBACK_CLASS)
  })

  it('highlights cards that load after the page has rendered', async () => {
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
              <article className='card' data-testid='late-card'>Speech Therapists</article>
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

    const card = await screen.findByTestId('late-card')
    // The MutationObserver callback runs as a microtask after the insert.
    await act(async () => { await Promise.resolve() })
    expect(card).toHaveClass(FALLBACK_CLASS)
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
