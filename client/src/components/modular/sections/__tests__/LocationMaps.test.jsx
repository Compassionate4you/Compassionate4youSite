// DT-909 / DT-912 Sprint 9
// Gandhar Tare
// Landing page locations come from the locations API: a location an admin
// adds shows up, and one they remove disappears. The request is mocked.
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import LocationMaps, { formatLocationAddress, mapLinksFor } from '../LocationMaps'
import { getPublicLocations } from '../../../../services/publicLocationsApi'

vi.mock('../../../../services/publicLocationsApi', () => ({
  getPublicLocations: vi.fn()
}))

const walnutCreek = {
  id: 'loc-1',
  name: 'Walnut Creek Office',
  streetAddress: '1501 N Broadway, Ste 350A/B',
  city: 'Walnut Creek',
  state: 'CA',
  zipCode: '94596',
  phone: '(925) 425-7104'
}
const sacramento = {
  id: 'loc-2',
  name: 'Sacramento Office',
  streetAddress: '100 Capitol Mall',
  city: 'Sacramento',
  state: 'CA',
  zipCode: '95814',
  phone: null
}

const FALLBACK = <p data-testid='fallback'>Original fixed map</p>

function renderMaps () {
  return render(<LocationMaps fallback={FALLBACK} mapTitle='Our Location' directionsText='Get Directions' />)
}

const addresses = () =>
  [...document.querySelectorAll('.modular-map-section__address')].map((el) => el.textContent)

beforeEach(() => {
  getPublicLocations.mockResolvedValue([walnutCreek])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('address and map links', () => {
  it('formats the address on one line', () => {
    expect(formatLocationAddress(walnutCreek)).toBe('1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596')
  })

  it('builds the map and directions links from the address, with no API key', () => {
    const links = mapLinksFor('100 Capitol Mall, Sacramento, CA 95814')
    expect(links.embedUrl).toBe('https://www.google.com/maps?q=100%20Capitol%20Mall%2C%20Sacramento%2C%20CA%2095814&output=embed')
    expect(links.directionsUrl).toBe('https://www.google.com/maps/dir/?api=1&destination=100%20Capitol%20Mall%2C%20Sacramento%2C%20CA%2095814')
    expect(links.embedUrl).not.toMatch(/key=/)
  })
})

describe('locations on the landing page (DT-911)', () => {
  it('shows each location from the database with its own map', async () => {
    getPublicLocations.mockResolvedValue([sacramento, walnutCreek])
    renderMaps()

    await waitFor(() => expect(addresses()).toHaveLength(2))
    expect(addresses()).toEqual([
      '100 Capitol Mall, Sacramento, CA 95814',
      '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
    ])

    const frames = document.querySelectorAll('iframe')
    expect(frames).toHaveLength(2)
    expect(frames[0]).toHaveAttribute('src', mapLinksFor('100 Capitol Mall, Sacramento, CA 95814').embedUrl)
    expect(frames[0]).toHaveAttribute('title', 'Sacramento Office')
  })

  it('gives each location a directions link to its own address', async () => {
    renderMaps()

    const link = await screen.findByRole('link', { name: /Get Directions/ })
    expect(link).toHaveAttribute('href', mapLinksFor(formatLocationAddress(walnutCreek)).directionsUrl)
  })

  it('uses the existing map block, so the look does not change', async () => {
    renderMaps()

    await waitFor(() => expect(addresses()).toHaveLength(1))
    expect(document.querySelector('.modular-map-section')).toBeInTheDocument()
    // The landing page hides the section heading, as before.
    expect(document.querySelector('.modular-map-section__title')).not.toBeInTheDocument()
  })
})

describe('admin changes show up (DT-912)', () => {
  it('a newly added location appears the next time the page loads', async () => {
    const { unmount } = renderMaps()
    await waitFor(() => expect(addresses()).toHaveLength(1))
    unmount()

    getPublicLocations.mockResolvedValue([sacramento, walnutCreek])
    renderMaps()

    await waitFor(() => expect(addresses()).toHaveLength(2))
    expect(addresses()).toContain('100 Capitol Mall, Sacramento, CA 95814')
  })

  it('a removed location disappears the next time the page loads', async () => {
    getPublicLocations.mockResolvedValue([sacramento, walnutCreek])
    const { unmount } = renderMaps()
    await waitFor(() => expect(addresses()).toHaveLength(2))
    unmount()

    getPublicLocations.mockResolvedValue([walnutCreek])
    renderMaps()

    await waitFor(() => expect(addresses()).toHaveLength(1))
    expect(addresses()).not.toContain('100 Capitol Mall, Sacramento, CA 95814')
  })

  it('shows no maps when every location has been removed', async () => {
    getPublicLocations.mockResolvedValue([])
    renderMaps()

    await waitFor(() => expect(screen.queryByTestId('fallback')).not.toBeInTheDocument())
    expect(document.querySelectorAll('iframe')).toHaveLength(0)
  })
})

describe('when the locations cannot be loaded', () => {
  it('keeps showing the original map while loading', () => {
    getPublicLocations.mockReturnValue(new Promise(() => {}))
    renderMaps()

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })

  it('keeps the original map if the request fails, so the section is never blank', async () => {
    getPublicLocations.mockRejectedValue(new Error('Failed to fetch'))
    renderMaps()

    await waitFor(() => expect(getPublicLocations).toHaveBeenCalled())
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })
})
