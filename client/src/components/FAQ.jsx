import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import "../styles/faq.css";

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-item__question"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          size={20}
          className={`faq-item__icon ${isOpen ? "faq-item__icon--open" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`faq-item__answer-wrapper ${
          isOpen ? "faq-item__answer-wrapper--open" : ""
        }`}
      >
        <div className="faq-item__answer-inner">
          <p className="faq-item__answer">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  // Must live inside the component so it updates when the language changes
  const faqData = t("faq.items", { returnObjects: true });

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-section__inner">
        <h2 className="faq-section__title">{t("faq.title")}</h2>
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onClick={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}