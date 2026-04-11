import "../styles/LandingPage.css";
import CareImage1 from "../assets/images/CareImage1.jpeg";
import { useTranslation } from "react-i18next";

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
      </section>
    </div>
  );
}

export default LandingPage;