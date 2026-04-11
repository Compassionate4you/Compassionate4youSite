import "../styles/LandingPage.css";
import CareImage1 from "../assets/images/CareImage1.jpeg";
import { useTranslation } from "react-i18next";

function LandingPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* HERO SECTION */}
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

      {/* PHILOSOPHY SECTION */}
      <section className="philosophy">
        <h2>{t("landing.philosophyTitle")}</h2>
        <p>{t("landing.philosophyText")}</p>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>{t("landing.footerSince")}</p>
        <p>{t("landing.footerAbout")}</p>
        <p>{t("landing.footerContact")}</p>
      </footer>
    </div>
  );
}

export default LandingPage;