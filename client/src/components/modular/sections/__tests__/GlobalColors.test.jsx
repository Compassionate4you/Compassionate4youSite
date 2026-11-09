import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DynamicSectionRenderer from '../../DynamicSectionRenderer'
import WelcomeSections from '../../WelcomeSections'
import HomeHealthSections from '../../HomeHealthSections'
import HospiceSections from '../../HospiceSections'
import { ColorConfigService } from '../../../../services/colorConfigService'

// DT-902: Give the renderer deliberately conflicting stored section and card colours.
const section = {
  id: 'custom-section',
  layout: 'CARD_GRID',
  content: {
    colors: { backgroundColor: 'custom' },
    cards: [{ id: 'custom-card', layout: 'HEADER_PARAGRAPH', content: { header: 'Custom card', colors: { backgroundColor: 'custom' } } }]
  }
}

// DT-902: Verify the full adapter-to-section-to-card colour policy and CMS compatibility.
describe('global colour source', () => {
  it.each([WelcomeSections, HomeHealthSections, HospiceSections])('ignores stored colours through each public page adapter', (Page) => {
    const lookup = vi.spyOn(ColorConfigService, 'getColorById').mockReturnValue({ lightModeColor: '#123456', darkModeColor: '#abcdef' })
    const { container } = render(<Page sections={[section]} theme='dark' />)
    expect(container.querySelector('.card-section').style.getPropertyValue('--section-bg')).toBe('var(--color-white)')
    expect(container.querySelector('[style*="--card-bg"]').style.getPropertyValue('--card-bg')).toBe('var(--color-white)')
    expect(lookup).not.toHaveBeenCalled()
    lookup.mockRestore()
  })

  it.each([['light', '#123456'], ['dark', '#abcdef']])('preserves CMS colours for other callers in %s mode', (theme, expected) => {
    const lookup = vi.spyOn(ColorConfigService, 'getColorById').mockReturnValue({ lightModeColor: '#123456', darkModeColor: '#abcdef' })
    const { container } = render(<DynamicSectionRenderer config={section} theme={theme} />)
    expect(container.querySelector('.card-section').style.getPropertyValue('--section-bg')).toBe(expected)
    expect(container.querySelector('[style*="--card-bg"]').style.getPropertyValue('--card-bg')).toBe(expected)
    lookup.mockRestore()
  })
})
