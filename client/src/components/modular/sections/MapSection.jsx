// DT-622 Sprint 8
// Preston Ball
// Modular Google Maps section component embedding interactive map and directions

import React from 'react'
import { MapPin } from 'lucide-react'
import '../../../styles/components/modular/sections/MapSection.css'

export default function MapSection ({
  config,
  content = {},
  style = {}
}) {
  const data = content || config?.content || {}
  const header = data.header || data.title || config?.title || 'Our Location'
  const mapAddress = data.mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'
  const embedUrl = data.embedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.6!2d-122.0651!3d37.9101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808561234567890%3A0xabcdef!2s1501+N+Broadway+Ste+350%2C+Walnut+Creek%2C+CA+94596!5e0!3m2!1sen!2sus!4v1700000000000'
  const directionsUrl = data.directionsUrl || 'https://www.google.com/maps/dir/?api=1&destination=1501+N+Broadway+Ste+350,+Walnut+Creek,+CA+94596'

  return (
    <section className="modular-map-section" style={style}>
      <div className="modular-map-section__inner">
        {header && (
          <h2 className="modular-map-section__title">
            {header}
          </h2>
        )}
        {mapAddress && (
          <p className="modular-map-section__address">
            {mapAddress}
          </p>
        )}
        <div className="modular-map-section__embed">
          <iframe
            title={header || 'Office Location Map'}
            src={embedUrl}
            className="modular-map-section__iframe"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modular-map-section__directions"
          >
            <MapPin size={18} aria-hidden="true" />
            Get Directions
          </a>
        )}
      </div>
    </section>
  )
}
