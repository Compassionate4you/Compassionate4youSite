import { useTranslation } from 'react-i18next';
import './styles/footer.css';
import './styles/resetfooter.css';

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__grid">

                    <div>
                        <h3 className="footer__heading">Compassionate Home Health &amp; Hospice</h3>
                        <p className="footer__about-text">{t('footer.tagline')}</p>
                    </div>

                    <div>
                        <h4 className="footer__subheading">{t('footer.quickLinks')}</h4>
                        <ul className="footer__links">
                            <li><a href="/" className="footer__link">{t('nav.home')}</a></li>
                            <li><a href="/home-health" className="footer__link">{t('nav.homeHealth')}</a></li>
                            <li><a href="/hospice" className="footer__link">{t('nav.hospice')}</a></li>
                            <li><a href="/schedule" className="footer__link">{t('nav.schedule')}</a></li>
                        </ul>
                    </div>

                    {/* DT-160: User can view the location of the company in the footer */}
                    <div>
                        <h4 className="footer__subheading">{t('footer.contactUs')}</h4>
                        <ul className="footer__contact-list">
                            <li className="footer__contact-item">
                                <svg className="footer__contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <span className="footer__contact-text">{t('footer.phone')}</span>
                            </li>
                            <li className="footer__contact-item">
                                <svg className="footer__contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <span className="footer__contact-text">{t('footer.email')}</span>
                            </li>
                            <li className="footer__contact-item">
                                <svg className="footer__contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
                                <address className="footer__location-address" style={{fontStyle: 'normal'}}>
                                    {t('footer.address1')}<br />
                                    {t('footer.address2')}
                                </address>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer__subheading">{t('footer.officeHours')}</h4>
                        <ul className="footer__hours-list">
                            <li className="footer__hours-item">
                                <svg className="footer__hours-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                </svg>
                                <span className="footer__hours-text">{t('footer.weekdays')}<br />{t('footer.weekdayHours')}</span>
                            </li>
                            <li className="footer__hours-indent">
                                <span className="footer__hours-text">{t('footer.saturday')}<br />{t('footer.saturdayHours')}</span>
                            </li>
                            <li className="footer__hours-indent">
                                <span className="footer__hours-text">{t('footer.sunday')}<br />{t('footer.sundayClosed')}</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;