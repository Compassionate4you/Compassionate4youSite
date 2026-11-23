import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DynamicSectionRenderer from '../../DynamicSectionRenderer'
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

// DT-902: Verify global vs CMS colour source handling in DynamicSectionRenderer.
describe('global colour source', () => {
  it('ignores stored colours when colorSource is global', () => {
    const lookup = vi.spyOn(ColorConfigService, 'getColorById').mockReturnValue({ lightModeColor: '#123456', darkModeColor: '#abcdef' })
    const { container } = render(<DynamicSectionRenderer config={section} theme='dark' colorSource='global' />)
    expect(container.querySelector('.card-section').style.getPropertyValue('--section-bg')).toBe('var(--color-white)')
    expect(container.querySelector('[style*="--card-bg"]').style.getPropertyValue('--card-bg')).toBe('var(--color-white)')
    expect(lookup).not.toHaveBeenCalled()
    lookup.mockRestore()
  })

  it.each([['light', '#123456'], ['dark', '#abcdef']])('preserves CMS colours for default cms mode in %s theme', (theme, expected) => {
    const lookup = vi.spyOn(ColorConfigService, 'getColorById').mockReturnValue({ lightModeColor: '#123456', darkModeColor: '#abcdef' })
    const { container } = render(<DynamicSectionRenderer config={section} theme={theme} />)
    expect(container.querySelector('.card-section').style.getPropertyValue('--section-bg')).toBe(expected)
    expect(container.querySelector('[style*="--card-bg"]').style.getPropertyValue('--card-bg')).toBe(expected)
    lookup.mockRestore()
  })
})
