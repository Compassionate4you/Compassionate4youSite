//  * Task: DT-508
//  * Author: PBall
//  * Sprint: Sprint 6

//DT-492 Content Editor - Preston Ball: Dynamic modular component renderer for staging and live page generation.
import React from 'react';
import '../../styles/modular-sections.css';

export default function DynamicSectionRenderer({ config, theme = 'light' }) {
  //DT-492 Content Editor - Preston Ball: Safeguard against empty or uninitialized section configurations.
  if (!config) return null;
  const { layout, title, content, colorSpec, cards = [] } = config;

  //DT-492 Content Editor - Preston Ball: Resolves light/dark palette specifications into CSS custom properties.
  const customStyles = {
    '--element-custom-bg':
      theme === 'dark' ? colorSpec?.darkMode || '#1e293b' : colorSpec?.lightMode || '#f8fafc',
    '--element-custom-text': theme === 'dark' ? '#f8fafc' : '#0f172a',
    '--element-card-bg': theme === 'dark' ? '#334155' : '#ffffff',
  };

  //DT-492 Content Editor - Preston Ball: Conditionally renders the proper layout structure based on config.layout.
  //DT-492 Content Editor - Preston Ball: In the future, we could extend this to support additional layouts or custom React components for more complex modular sections.
  return (
    <section className={`modular-section modular-layout--${layout?.toLowerCase() || 'grid-cards'}`} style={customStyles}>
      <div className="modular-section__inner">
        {title && <h3 className="modular-section__title">{title}</h3>}
        {layout === 'IMAGE_HEADER' && (
          <div className="modular-layout--image-header">
            {config.imageUrl && <img src={config.imageUrl} alt={title || 'Section visual'} />}
            {content && <p>{content}</p>}
          </div>
        )}
        {layout === 'IMAGE_PARAGRAPH' && (
          <div className="modular-layout--image-paragraph">
            {config.imageUrl && <img src={config.imageUrl} alt={title || 'Section visual'} />}
            <div className="modular-text">{content}</div>
          </div>
        )}
        {layout === 'SPLIT_CONTAINER' && (
          <div className="modular-layout--split-container">
            <div className="split-content">{content}</div>
            {config.imageUrl && <img className="split-media" src={config.imageUrl} alt={title || 'Visual'} />}
          </div>
        )}
        {layout === 'GRID_CARDS' && (
          <div className="modular-layout--grid-cards">
            {cards.map((card, idx) => (
              <div key={card.id || idx} className="modular-card">
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}