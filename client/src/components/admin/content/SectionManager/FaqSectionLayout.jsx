// DT-923 Sprint 9
// PBall
// Form fields component for the FAQ_SECTION section layout in SectionManager

import React from 'react'
import TypographyControls from '../TypographyControls'

export default function FaqSectionLayout ({
  header,
  onHeaderChange,
  headerTypography,
  onHeaderTypographyChange,
  faqItems = [],
  onFaqItemsChange,
  onMoveFaqItem,
  onRemoveFaqItem
}) {
  const handleAddFaqItem = () => {
    onFaqItemsChange([...faqItems, { question: '', answer: '' }])
  }

  const handleQuestionChange = (idx, value) => {
    const next = faqItems.map((item, i) => (i === idx ? { ...item, question: value } : item))
    onFaqItemsChange(next)
  }

  const handleAnswerChange = (idx, value) => {
    const next = faqItems.map((item, i) => (i === idx ? { ...item, answer: value } : item))
    onFaqItemsChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* DT-923 Sprint 9 - PBall: Section title and typography controls */}
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Title / Header</label>
        <input
          type="text"
          value={header}
          onChange={(e) => onHeaderChange(e.target.value)}
          placeholder="Primary section header"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        <TypographyControls
          label="Header Typography & Alignment"
          value={headerTypography}
          onChange={onHeaderTypographyChange}
        />
      </div>

      {/* DT-923 Sprint 9 - PBall: FAQ_SECTION with removal and reordering */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: '600', fontSize: '13px' }}>FAQ Items ({faqItems.length})</label>
          <button
            type="button"
            onClick={handleAddFaqItem}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            + Add Question
          </button>
        </div>
        {faqItems.map((item, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Item #{idx + 1}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" title="Move Up" disabled={idx === 0} onClick={() => onMoveFaqItem(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>▲</button>
                <button type="button" title="Move Down" disabled={idx === faqItems.length - 1} onClick={() => onMoveFaqItem(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.75rem', cursor: idx === faqItems.length - 1 ? 'not-allowed' : 'pointer' }}>▼</button>
                <button type="button" title="Remove FAQ" onClick={() => onRemoveFaqItem(idx)} style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>- Remove</button>
              </div>
            </div>
            <input
              type="text"
              value={item.question}
              onChange={(e) => handleQuestionChange(idx, e.target.value)}
              placeholder="Question"
              style={{ width: '100%', marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            <textarea
              rows={2}
              value={item.answer}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              placeholder="Answer"
              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
