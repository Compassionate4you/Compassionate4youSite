import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import "../styles/accountbenefits.css";

const benefits = [
  {
    heading: "Book Appointments in Seconds!",
    description: "Easily fill out the applitcation and book your first appointment with us. You can see your scheduled appointments and see information regarding the location, time and more",
  },
  {
    heading: "Reschedule with Ease", 
    description: "Simply sign in with your account information, and with a few clicks, you can change the date,time and location of your appointment. This is all saved under your account information",
  },
  {
    heading: "Never Miss a Visit",
    description: " If you were to sign up and create an account, you can view and adjust all your information as needed and view the important details for your first and following visits", 
  },
];

export default function AccountBenefits() {
  return (
    <section className="account-benefits-section" id="account-benefits">
      <div className="account-benefits-section__inner">
        <h2 className="account-benefits-section__title">
          Why Should I Create an Account?
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