import './styles/map.css';

function LocationsPage() {
    return (
        <section className="map-section">
            <div className="map-section__inner">
                <h2 className="map-section__title">Our Location</h2>

                {/* DT-163: User can see their distance from one of the companies locations */}
                <div className="distance-card" id="distance-card">
                    <svg className="distance-card__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                        <div className="distance-card__label">Your distance to our office</div>
                        {/* DT-160: User can view the location of the company */}
                        <div className="distance-card__value" id="distance-value">Calculating…</div>
                        <div className="distance-card__address">1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596</div>
                    </div>
                </div>

                <div className="map-embed">
                    <iframe
                        title="Compassionate Home Health &amp; Hospice location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.6!2d-122.0651!3d37.9101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808561234567890%3A0xabcdef!2s1501+N+Broadway+Ste+350%2C+Walnut+Creek%2C+CA+94596!5e0!3m2!1sen!2sus!4v1700000000000"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    <div className="map-embed__fallback" id="map-fallback" style={{display: 'none'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>1501 N Broadway, Ste 350A/B</p>
                        <small>Walnut Creek, CA 94596</small>
                    </div>
                </div>

                <a
                    className="map-section__directions"
                    href="https://www.google.com/maps/dir/?api=1&destination=1501+N+Broadway+Ste+350,+Walnut+Creek,+CA+94596"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Get Directions
                </a>
            </div>
        </section>
    );
}

export default LocationsPage;