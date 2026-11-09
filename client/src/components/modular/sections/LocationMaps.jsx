// DT-909 Sprint 9
// Gandhar Tare
// Landing page locations, loaded from the locations API (DT-910) so a
// location an admin adds or removes shows up or disappears on its own
// (DT-911). Each location uses the existing map block, unchanged.

import { useEffect, useState } from 'react'
import MapSection from './MapSection'
import { getPublicLocations } from '../../../services/publicLocationsApi'

// DT-911: "1501 N Broadway, Walnut Creek, CA 94596"
export function formatLocationAddress (location) {
  const cityLine = [location.city, [location.state, location.zipCode].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  return [location.streetAddress, cityLine].filter(Boolean).join(', ')
}

// DT-911: Google Maps embed and directions links built from the address.
// This embed format needs no API key.
export function mapLinksFor (address) {
  const query = encodeURIComponent(address)
  return {
    embedUrl: `https://www.google.com/maps?q=${query}&output=embed`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${query}`
  }
}

// fallback: the map block exactly as the page showed it before DT-909. It is
// shown while the locations load and if they cannot be loaded, so the
// section is never blank and the page does not jump.
export default function LocationMaps ({ fallback, directionsText, mapTitle }) {
  // 'loading' | 'ready' | 'failed'
  const [status, setStatus] = useState('loading')
  const [locations, setLocations] = useState([])

  useEffect(() => {
    let cancelled = false
    getPublicLocations()
      .then((list) => {
        if (cancelled) return
        setLocations(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => { cancelled = true }
  }, [])

  if (status !== 'ready') return fallback ?? null

  // The API already returns the locations sorted by name.
  return locations.map((location) => {
    const address = formatLocationAddress(location)
    return (
      <MapSection
        key={location.id}
        content={{
          hideHeading: true,
          header: location.name || mapTitle,
          mapAddress: address,
          directionsText,
          ...mapLinksFor(address)
        }}
      />
    )
  })
}
