//Footer made specifically for Admin Dash
function AdminFooter() {
    return (
        <footer className="admin-footer">
            <div className="admin-footer-content">
                {/* Contact information */}
                <section className="admin-footer-column">
                    <h3>Contact Information</h3>

                    <div className="admin-footer-item">
                        <svg
                            className="admin-footer-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>

                        <a href="tel:+19254257104">
                            (925) 425-7104
                        </a>
                    </div>

                    <div className="admin-footer-item">
                        <svg
                            className="admin-footer-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>

                        <a href="mailto:info@compassionate4you.com">
                            info@compassionate4you.com
                        </a>
                    </div>
                </section>

                {/* Office address */}
                <section className="admin-footer-column admin-footer-address-column">
                    <h3>Office Address</h3>

                    <div className="admin-footer-item">
                        <svg
                            className="admin-footer-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>

                        <address className="admin-footer-address">
                            1501 N Broadway, Ste 350A/B
                            <br />
                            Walnut Creek, CA 94596
                        </address>
                    </div>
                </section>

                {/* Office hours */}
                <section className="admin-footer-column">
                    <h3>Office Hours</h3>

                    <div className="admin-footer-item">
                        <svg
                            className="admin-footer-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>

                        <div className="admin-footer-hours">
                            <div className="admin-footer-hours-row">
                                <span>Monday-Friday</span>
                                <span>8:00 AM - 6:00 PM</span>
                            </div>

                            <div className="admin-footer-hours-row">
                                <span>Saturday</span>
                                <span>9:00 AM - 2:00 PM</span>
                            </div>

                            <div className="admin-footer-hours-row">
                                <span>Sunday</span>
                                <span>Closed</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="admin-footer-bottom">
                <p>
                    © {new Date().getFullYear()} Compassionate Home Health
                    & Hospice
                    <span className="admin-footer-divider">|</span>
                    Admin Portal
                </p>
            </div>
        </footer>
    );
}

export default AdminFooter;