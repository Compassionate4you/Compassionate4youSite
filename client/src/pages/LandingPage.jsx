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

        <div className="info-card">
          <div className="info-card-image">
            <img
              src="/images/medicare-home-health.jpg"
              alt="People working on a puzzle together"
            />
          </div>

          <div className="info-card-content">
            <h3>Medicare Home Health Criteria</h3>
            <p>
              To qualify for Medicare home health services, a patient must be
              confined to the home and be under physician care who is a doctor of
              medicine, a doctor of osteopathy, or a doctor of podiatric medicine,
              and enrolled in the Medicare Program.
            </p>
          </div>
        </div>

        <div className="info-card reverse">
          <div className="info-card-image">
            <img
              src="/images/specialty-services.jpg"
              alt="Older couple smiling together"
            />
          </div>

          <div className="info-card-content">
            <h3>Specialty Services</h3>
            <p>
              To provide comprehensive, high quality home-care services to our
              patients by creating strong partnerships with their families, case
              managers, discharge planners and physicians.
            </p>

            <p>
              We believe in creating a team of caring professionals whose goal is
              the care and support of our patients.
            </p>
          </div>
        </div>
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