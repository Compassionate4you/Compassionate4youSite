// DT-622 Sprint 8
// Preston Ball
// Modular account benefits section component rendering customizable benefits checklist

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import '../../../styles/components/modular/sections/AccountBenefitsSection.css'

export default function AccountBenefitsSection ({
  config,
  content = {},
  style = {}
}) {
  const { t } = useTranslation()
  const data = content || config?.content || {}

  const title = data.title || data.header || config?.title || t('accountBenefits.title')
  const rawItems = Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : t('accountBenefits.items', { returnObjects: true })
  const benefits = Array.isArray(rawItems) ? rawItems : []

  return (
    <section className="account-benefits-section" id="account-benefits" style={style}>
      <div className="account-benefits-section__inner">
        {title && (
          <h2 className="account-benefits-section__title">
            {title}
          </h2>
        )}
        <ul className="account-benefits-section__list">
          {benefits.map((benefit, index) => (
            <li className="account-benefits-section__item" key={index}>
              <span className="account-benefits-section__bullet" aria-hidden="true">
                <Check size={16} />
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
  )
}
