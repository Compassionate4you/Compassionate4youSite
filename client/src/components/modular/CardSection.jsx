import { useTranslation } from 'react-i18next';
import useSection from '../../hooks/useSection';
import Card from './Card';
import { pickText } from './cardText';
import { withWelcomeTranslations } from './welcomeCardTranslations';

// Database content takes priority; original welcome copy has local translation fallbacks.
export default function CardSection({ slug, className = '' }) {
  const { i18n } = useTranslation();
  const { section, loading, error } = useSection(slug);

  if (error) console.error('CardSection failed:', slug, error);
  if (loading || error || !section || !Array.isArray(section.cards)) return null;

  const title = pickText(section.title, i18n.language);
  const hasImageCards = section.cards.every((c) => c.layoutType === 'IMAGE_FULL_WIDTH');
  const columns = hasImageCards ? 1 : section.columns;

  const sectionClassName = ['card-section', className].filter(Boolean).join(' ');

  return (
    <section className={sectionClassName} aria-label={title || undefined}>
      {title && <h2 className="card-section__title">{title}</h2>}
      <div className="card-grid" style={{ '--card-columns': columns }}>
        {section.cards.map((card) => <Card key={card.id} card={withWelcomeTranslations(card, slug, i18n)} />)}
      </div>
    </section>
  );
}
