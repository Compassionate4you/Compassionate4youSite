// DT-622 Sprint 8
// Preston Ball
// Modular FAQ accordion section component rendering customizable Q&A items

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import '../../../styles/components/modular/sections/FAQSection.css'

function FAQItem ({ question, answer, isOpen, onClick }) {
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
          className={`faq-item__icon ${isOpen ? 'faq-item__icon--open' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`faq-item__answer-wrapper ${
          isOpen ? 'faq-item__answer-wrapper--open' : ''
        }`}
      >
        <div className="faq-item__answer-inner">
          <p className="faq-item__answer">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQSection ({
  config,
  content = {},
  style = {}
}) {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)

  const data = content || config?.content || {}
  const title = data.title || data.header || config?.title || t('faq.title')

  let rawItems = data.faqItems || data.items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    rawItems = t('faq.items', { returnObjects: true })
  }

  const items = Array.isArray(rawItems)
    ? rawItems.map((item) => ({
      question: item.question || item.q || '',
      answer: item.answer || item.a || ''
    }))
    : []

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section" id="faq" style={style}>
      <div className="faq-section__inner">
        {title && <h2 className="faq-section__title">{title}</h2>}
        {items.map((item, index) => (
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
  )
}
