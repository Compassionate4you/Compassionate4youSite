// DT-516 Sprint 7
// PBall
// Dynamic modular component renderer supporting sections and cards

import React, { useState } from 'react'
import { ColorConfigService } from '../../services/colorConfigService'
import { CardStorageService } from '../../services/cardStorageService'
import { ChevronDown, ChevronUp } from 'lucide-react'
import '../../styles/modular-sections.css'

export default function DynamicSectionRenderer ({ config, theme = 'light' }) {
  if (!config) return null
  const { layout, title, content, colors = {}, cards = [] } = config

  const resolveColor = (colorId, fallback) => {
    if (!colorId) return fallback
    const c = ColorConfigService.getColorById(colorId)
    if (!c) return fallback
    return theme === 'dark' ? c.darkModeColor : c.lightModeColor
  }

  const customStyles = {
    '--section-bg': resolveColor(colors.backgroundColor, theme === 'dark' ? '#1e293b' : '#f8fafc'),
    '--section-header': resolveColor(colors.headerColor, theme === 'dark' ? '#f8fafc' : '#0f172a'),
    '--section-text': resolveColor(colors.textColor, theme === 'dark' ? '#cbd5e1' : '#334155')
  }

  const [openFaq, setOpenFaq] = useState(null)
  const [sent, setSent] = useState(false)

  const renderCard = (cardCfg) => {
    if (!cardCfg) return null
    const cc = cardCfg.colors || {}
    const cdata = cardCfg.content || {}
    const style = {
      backgroundColor: resolveColor(cc.backgroundColor, theme === 'dark' ? '#334155' : '#ffffff'),
      color: resolveColor(cc.textColor, theme === 'dark' ? '#f8fafc' : '#1e293b')
    }
    return (
      <div className="modular-card" style={style} key={cardCfg.id}>
        <h4 style={{ color: resolveColor(cc.headerColor, 'inherit') }}>{cdata.header}</h4>
        <p>{cdata.text}</p>
      </div>
    )
  }

  const resolvedCards = (content?.cardIds || []).map(id => CardStorageService.getCardById(id)).filter(Boolean)
  const displayCards = resolvedCards.length > 0 ? resolvedCards : cards

  return (
    <section className={`modular-section modular-layout--${layout?.toLowerCase() || 'header-text'}`} style={customStyles}>
      <div className="modular-section__inner">
        {layout === 'IMAGE_HEADER_TEXT' && (
          <div>
            {content?.imageUrl && <img src={content.imageUrl} alt="" className="modular-hero-img" />}
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title}</h3>
            <p className="modular-section__desc" style={{ color: 'var(--section-text)' }}>{content?.text}</p>
          </div>
        )}
        {layout === 'FULLSCREEN_IMAGE_HEADER' && (
          <div style={{ padding: '40px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
            <h3 className="modular-section__title" style={{ color: '#fff' }}>{content?.header || title}</h3>
            <p style={{ color: '#f1f5f9' }}>{content?.text}</p>
          </div>
        )}
        {layout === 'HEADER_TEXT' && (
          <div>
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title}</h3>
            <p className="modular-section__desc" style={{ color: 'var(--section-text)' }}>{content?.text}</p>
          </div>
        )}
        {layout === 'CARD_GRID' && (
          <div>
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Number(content?.gridCols) || 3, 4)}, minmax(200px, 1fr))`, gap: '16px' }}>
              {displayCards.map(c => renderCard(c))}
            </div>
          </div>
        )}
        {layout === 'FAQ_SECTION' && (
          <div>
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title || 'FAQ'}</h3>
            <div>
              {(content?.faqItems || []).map((fq, idx) => (
                <div key={idx} style={{ marginBottom: '8px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{fq.q}</span>
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openFaq === idx && <p style={{ marginTop: '6px', color: 'var(--section-text)' }}>{fq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {layout === 'MAP_SECTION' && (
          <div>
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title || 'Location'}</h3>
            <p style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--section-text)' }}>{content?.mapAddress || '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596'}</p>
            <div style={{ height: '220px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Google Maps Preview</p>
            </div>
          </div>
        )}
        {layout === 'CONTACT_SECTION' && (
          <div>
            <h3 className="modular-section__title" style={{ color: 'var(--section-header)' }}>{content?.header || title || 'Contact Us'}</h3>
            <div style={{ background: theme === 'dark' ? '#334155' : '#fff', padding: '16px', borderRadius: '8px', maxWidth: '480px', margin: '0 auto' }}>
              {sent ? <p>Thank you! Message sent.</p> : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Name" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <input type="email" placeholder="Email" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <textarea rows={3} placeholder="Message" required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Send</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}