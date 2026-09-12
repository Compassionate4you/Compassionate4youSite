import "../styles/LandingPage.css";
import CareImage1 from "../assets/images/CareImage1.jpeg";
import { useTranslation } from "react-i18next";
import "../styles/map.css";

function LandingPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <h1>{t("landing.heroTitle")}</h1>
          <p>{t("landing.heroSubtitle")}</p>
        </div>

        <div className="hero-right">
          <img
            src={CareImage1}
            alt={t("landing.heroImageAlt")}
            className="hero-img"
          />
        </div>
      </section>

      {/* Philosophy */}
      <section className="philosophy">
        <h2 className="section-title title-philosophy">{t("landing.philosophyTitle")}</h2>
        <p>{t("landing.philosophyText")}</p>
      </section>

      {/* Caring Since 2021 */}
      <section className="care">
        <h2 className="section-title title-care">{t("landing.caringSinceTitle")}</h2>
        <p>{t("landing.caringSinceText")}</p>
      </section>

      {/* About */}
      <section className="about">
        <h2 className="section-title title-about">{t("landing.aboutTitle")}</h2>
        <p>{t("landing.aboutText")}</p>
      </section>

      {/* Contact */}
      <section className="contact-section">
        <h2 className="section-title title-contact">{t("landing.contactTitle")}</h2>

        <div className="contact-container">

          {/* Contact Information */}
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <h3>{t("landing.contactPhoneLabel")}</h3>
                <p>{t("landing.contactPhone")}</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div>
                <h3>{t("landing.contactEmailLabel")}</h3>
                <p>{t("landing.contactEmail")}</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📠</div>
              <div>
                <h3>{t("landing.contactFaxLabel")}</h3>
                <p>{t("landing.contactFax")}</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <h3>{t("landing.contactAddressLabel")}</h3>
                <p>{t("landing.contactAddressLine1")}</p>
                <p>{t("landing.contactAddressLine2")}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <form className="contact-form">
              <label htmlFor="name">{t("landing.contactFormName")}</label>
              <input
                id="name"
                type="text"
                placeholder={t("landing.contactFormNamePlaceholder")}
              />

              <label htmlFor="email">{t("landing.contactFormEmail")}</label>
              <input
                id="email"
                type="email"
                placeholder={t("landing.contactFormEmailPlaceholder")}
              />

              <label htmlFor="message">{t("landing.contactFormMessage")}</label>
              <textarea
                id="message"
                rows="6"
                placeholder={t("landing.contactFormMessagePlaceholder")}
              ></textarea>

              <button type="submit" className="contact-btn">
                {t("landing.contactFormButton")}
              </button>
            </form>
          </div>
        </div>
        {/* DT-352 Map Adjustments */}
      </section>
      <section className="map-section">
        <div className="map-section__inner">
          <div className="map-embed">
            <iframe
              title={t('locations.mapTitle')}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.6!2d-122.0651!3d37.9101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808561234567890%3A0xabcdef!2s1501+N+Broadway+Ste+350%2C+Walnut+Creek%2C+CA+94596!5e0!3m2!1sen!2sus!4v1700000000000"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="map-embed__fallback" id="map-fallback" style={{ display: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p>{t('locations.address2')}</p>
              <small>{t('locations.address3')}</small>
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
            {t('locations.getDirections')}
          </a>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;