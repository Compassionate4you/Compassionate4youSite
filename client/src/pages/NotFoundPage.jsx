import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/notfound.css";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="notfound-section">
      <div className="notfound-section__inner">
        <p className="notfound-section__code">404</p>
        <h1 className="notfound-section__title">{t("notFound.title")}</h1>
        <p className="notfound-section__message">{t("notFound.message")}</p>
        <Link to="/" className="notfound-section__home-link">
          {t("notFound.home")}
        </Link>
      </div>
    </section>
  );
}