import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import "../styles/accountbenefits.css";

export default function AccountBenefits() {
  const { t } = useTranslation();
  const benefits = t("accountBenefits.items", { returnObjects: true });

  return (
    <section className="account-benefits-section" id="account-benefits">
      <div className="account-benefits-section__inner">
        <h2 className="account-benefits-section__title">
          {t("accountBenefits.title")}
        </h2>
        <ul className="account-benefits-section__list">
          {benefits.map((benefit, index) => (
            <li className="account-benefits-section__item" key={index}>
              <span className="account-benefits-section__bullet">
                <Check size={16} aria-hidden="true" />
              </span>
              <div className="account-benefits-section__text">
                <h3 className="account-benefits-section__heading">
                  {benefit.heading}
                </h3>
                <p className="account-benefits-section__description">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}