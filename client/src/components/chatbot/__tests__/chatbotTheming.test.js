// DT-626 / DT-627 / DT-628: the chatbot must follow the site's colour scheme
// and react to the accessibility controls.
//
// These read the stylesheets directly. The accessibility panel works by
// setting attributes on the root element and CSS responds, so asserting on
// the CSS is what actually proves the behaviour.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))
const chatbotDir = path.resolve(here, '..')
const stylesDir = path.resolve(here, '../../../styles')

const chatWindowCss = fs.readFileSync(
  path.join(chatbotDir, 'components/styles/ChatWindow.css'),
  'utf8'
)
const widgetCss = fs.readFileSync(
  path.join(chatbotDir, 'app_imports/styles/ChatbotWidget.css'),
  'utf8'
)
const globalCss = fs.readFileSync(path.join(stylesDir, 'global.css'), 'utf8')

// Strips comments and rgba() shadows so only real colour declarations remain.
function declarationsOnly (css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/rgba\([^)]*\)/g, '')
}

describe('DT-626: chatbot uses the shared colour tokens', () => {
  it('global.css defines the shared tokens the chatbot relies on', () => {
    for (const token of [
      '--color-primary',
      '--color-charcoal',
      '--color-muted-text',
      '--color-divider',
      '--color-page-background'
    ]) {
      expect(globalCss).toContain(token)
    }
  })

  it('the chat window declares no hard-coded hex colours', () => {
    const hexes = declarationsOnly(chatWindowCss).match(/#[0-9a-fA-F]{6}\b/g) || []
    // Any hex left should only ever appear as a var() fallback.
    const outsideFallback = hexes.filter((hex) => {
      const pattern = new RegExp(`var\\([^)]*${hex}[^)]*\\)`)
      return !pattern.test(declarationsOnly(chatWindowCss))
    })
    expect(outsideFallback).toEqual([])
  })

  it('the chat window maps its accent to the site primary colour', () => {
    expect(chatWindowCss).toMatch(/--chat-accent:\s*var\(--color-primary/)
  })

  it('the chat window maps its text colour to the site text token', () => {
    expect(chatWindowCss).toMatch(/--chat-text:\s*var\(--color-charcoal/)
  })

  it('the launcher button uses the site primary colour', () => {
    expect(widgetCss).toMatch(/--chatbot-btn-color:\s*var\(--color-primary/)
  })

  it('the chat window uses the shared radius token', () => {
    expect(chatWindowCss).toMatch(/--chat-radius:\s*var\(--radius-/)
  })
})

describe('DT-628: chatbot reacts to the accessibility controls', () => {
  it('responds to dark mode set on the root element', () => {
    expect(chatWindowCss).toContain(':root[data-theme="dark"] .chat-window')
  })

  it('overrides its surface colours in dark mode, not just the accent', () => {
    const darkBlock = chatWindowCss.slice(
      chatWindowCss.indexOf(':root[data-theme="dark"] .chat-window')
    )
    expect(darkBlock).toContain('--chat-bg')
    expect(darkBlock).toContain('--chat-text')
  })

  it('keeps FAQ and action buttons legible in dark mode', () => {
    expect(chatWindowCss).toContain(':root[data-theme="dark"] .chat-window .chat-action-btn')
    expect(chatWindowCss).toContain(':root[data-theme="dark"] .chat-window .chat-faq__item')
  })

  it('sizes chat text in relative units so it scales with the text-size tools', () => {
    const fixedFontSizes =
      declarationsOnly(chatWindowCss).match(/font-size:\s*\d+px/g) || []
    expect(fixedFontSizes).toEqual([])
  })

  it('sizes the launcher in relative units too', () => {
    expect(widgetCss).toMatch(/--chatbot-btn-size:\s*[\d.]+rem/)
    expect(widgetCss).toMatch(/--chatbot-btn-font-size:\s*[\d.]+rem/)
  })

  it('inherits high contrast, which global.css applies to the whole page', () => {
    // The filter is applied at :root, so every descendant including the
    // chatbot is covered. This guards against that rule being removed.
    expect(globalCss).toMatch(/:root\.high-contrast/)
  })

  it('uses a focus outline colour from the shared tokens', () => {
    expect(chatWindowCss).toMatch(/outline:[^;]*var\(--color-link-highlight/)
  })
})

describe('DT-627: chatbot reads as part of the site', () => {
  it('uses the site heading font in the chat window', () => {
    expect(chatWindowCss).toMatch(/font-family:[^;]*Crimson Text/)
  })

  it('uses the shared page background for bot message bubbles', () => {
    expect(chatWindowCss).toMatch(/--chat-bot-bg:\s*var\(--color-page-background/)
  })

  it('uses the shared divider colour for its borders', () => {
    expect(chatWindowCss).toMatch(/--chat-border:\s*var\(--color-divider/)
  })
})
