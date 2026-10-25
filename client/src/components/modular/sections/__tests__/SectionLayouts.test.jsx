import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeaderCardsSection, HeaderStackSection, TimelineSection } from '..'

const items = [
  { id: 'referral', title: 'Referral', description: 'Family starts the process.', iconName: 'Users' },
  { id: 'assessment', title: 'Assessment', description: 'A nurse evaluates health and goals.', iconName: 'ClipboardCheck' },
  { id: 'plan', title: 'Care plan', description: 'Care is tailored to each person.' }
]

const components = [HeaderCardsSection, HeaderStackSection, TimelineSection]

for (const Component of components) {
  describe(Component.name, () => {
    it('labels each section with a unique heading and renders supplied copy', () => {
      render(<><Component title='Care' subtitle='Support at home.' label='Our team' items={items} /><Component title='Care' /></>)
      const sections = screen.getAllByRole('region', { name: 'Care' })
      expect(sections).toHaveLength(2)
      expect(sections[0].getAttribute('aria-labelledby')).not.toBe(sections[1].getAttribute('aria-labelledby'))
      expect(screen.getByText('Support at home.')).toBeInTheDocument()
      expect(screen.getByText('Our team')).toBeInTheDocument()
      expect(screen.getByText(items[0].description)).toBeVisible()
    })

    it('supports missing or empty items and omitted optional heading content', () => {
      const { container, rerender } = render(<Component />)
      expect(container.querySelector('section')).toBeInTheDocument()
      expect(container.querySelector('h2')).not.toBeInTheDocument()
      expect(container.querySelector('.c4-section__label')).not.toBeInTheDocument()
      expect(container.querySelector('.c4-section__subtitle')).not.toBeInTheDocument()
      rerender(<Component title='Empty' items={[]} />)
      expect(screen.getByRole('heading', { name: 'Empty' })).toBeInTheDocument()
      expect(container.querySelector('h3')).not.toBeInTheDocument()
    })

    it('renders long copy as text, without injecting markup or adding interactions', () => {
      const description = '<script>alert(1)</script> ' + 'Long description. '.repeat(100)
      const { container } = render(<Component items={[{ id: 'long', title: 'Long title '.repeat(30), description }]} />)
      expect(container.querySelector('.c4-section__description').textContent).toBe(description)
      expect(container.querySelector('script, button, details')).not.toBeInTheDocument()
    })
  })
}

describe('HeaderCardsSection options', () => {
  it('defaults to header-left and accepts the reverse layout', () => {
    const { container, rerender } = render(<HeaderCardsSection title='Care' items={items} />)
    expect(container.querySelector('section')).not.toHaveClass('c4-header-cards--right')
    rerender(<HeaderCardsSection title='Care' items={items} headerPosition='right' />)
    expect(container.querySelector('section')).toHaveClass('c4-header-cards--right')
    expect(container.querySelector('.c4-section__inner').firstElementChild.tagName).toBe('HEADER')
  })

  it('handles an optional decorative background, failure, and replacement', () => {
    const { container, rerender } = render(<HeaderCardsSection title='Care' />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    rerender(<HeaderCardsSection title='Care' backgroundImageUrl='/care.jpg' />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(container.querySelector('section')).toHaveClass('c4-header-cards--image')
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('section')).not.toHaveClass('c4-header-cards--image')
    expect(screen.getByRole('heading', { name: 'Care' })).toBeInTheDocument()
    rerender(<HeaderCardsSection title='Care' backgroundImageUrl='/replacement.jpg' />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/replacement.jpg')
  })

  it('renders known icons and safely falls back for missing or unsupported names', () => {
    const iconItems = [
      items[0], { id: 'missing' }, { id: 'unknown', iconName: 'NotAnIcon' }, { id: 'prototype', iconName: 'constructor' }
    ]
    const { container } = render(<HeaderCardsSection items={iconItems} />)
    const icons = container.querySelectorAll('.c4-header-cards__icon svg')
    expect(icons).toHaveLength(4)
    expect(icons[0]).toHaveClass('lucide-users')
    for (const icon of [...icons].slice(1)) expect(icon).toHaveClass('lucide-heart')
    for (const icon of icons) expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('HeaderStackSection options', () => {
  it('defaults to one column and keeps all content visible with two columns and an odd card count', () => {
    const { container, rerender } = render(<HeaderStackSection items={items} />)
    expect(container.querySelector('.c4-header-stack__grid')).not.toHaveClass('c4-header-stack__grid--two')
    rerender(<HeaderStackSection items={items} columns={2} />)
    expect(container.querySelector('.c4-header-stack__grid')).toHaveClass('c4-header-stack__grid--two')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    for (const item of items) expect(screen.getByText(item.description)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('TimelineSection ordering', () => {
  it('numbers steps in input order and updates numbering when reordered', () => {
    const { rerender } = render(<TimelineSection items={items} />)
    expect(screen.getAllByRole('listitem').map(step => within(step).getByRole('heading').textContent)).toEqual(items.map(item => item.title))
    const reordered = [...items].reverse()
    rerender(<TimelineSection items={reordered} />)
    screen.getAllByRole('listitem').forEach((step, index) => {
      expect(within(step).getByRole('heading')).toHaveTextContent(reordered[index].title)
      expect(step.querySelector('.c4-timeline__number')).toHaveTextContent(String(index + 1))
    })
  })

  it('supports one step and switches to vertical for more than five', () => {
    const { container, rerender } = render(<TimelineSection items={items.slice(0, 1)} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(container.querySelector('.c4-timeline__steps')).not.toHaveClass('c4-timeline__steps--vertical')
    rerender(<TimelineSection items={Array.from({ length: 6 }, (_, index) => ({ ...items[0], id: `step-${index}` }))} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(container.querySelector('.c4-timeline__steps')).toHaveClass('c4-timeline__steps--vertical')
  })
})
