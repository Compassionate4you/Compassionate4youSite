import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/faq.css";

const faqData = [
  {
    question: "What does hospice provide?",
    answer: "Hospice offers care from a team of different types of practioners who work together to meet the medical, psychological and spiritual needs of you and your family.", // TODO: Add answer 1
  },
  {
    question: "What other benefits do patients have when they are under hospicecare", // TODO: Add question 2
    answer: "Once you're admitted into the Hospice Program, you will be provided with medical appliances, medical supplies and medication for symptoms and pain relief", // TODO: Add answer 2
  },
  {
    question: "Who provides the care?", // TODO: Add question 3
    answer: "The foundation of our service is a team of highly skilled and trained  professionals providing compassionate and personalized care tailored to the unique needs of each individual. We have a disciplinary team of various professionals, including physicians, nurses, social workers, chaplains, and hospice aides, to provide comprehensive care and support to patients and their families. Other disciplines like physical, occupational, and speech therapists, as well as volunteers and bereavement specialists, may also be involved, depending on the patient's individualized specific needs and the hospice provider's orders.", // TODO: Add answer 3
  },
  {
    question: "What kind of help might I need?", // TODO: Add question 4
    answer: "At some point, you may become confined to bed and unable to turn over or eat without help. Your caregiver may need to change your diapers and linens and care for your skin to prevent bedsores. Hospice nurses will teach caregivers how to perform these tasks.", // TODO: Add answer 4
  },
  {
    question: "What if a difficult situation arises?", // TODO: Add question 5
    answer: "We understand that caregivers may face difficult situations. A 24-hour phone line puts the caregiver in touch with a hospice-trained nurse who can give advice over the phone or make a home visit if necessary.", // TODO: Add answer 5
  },
];

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
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-section__inner">
        <h2 className="faq-section__title">Frequently asked questions</h2>
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