import { useTranslation } from 'react-i18next';
import useSection from '../../hooks/useSection';
import Card from './Card';
import { pickText } from './cardText';

// <CardSection slug="welcome-info" /> renders a section entirely from the database.
export default function CardSection({ slug }) {
  const { i18n } = useTranslation();
  const { section, loading, error } = useSection(slug);

if (error) console.error('CardSection failed:', slug, error);
if (loading || error || !section) return null;
  const title = pickText(section.title, i18n.language);
  const hasImageCards = section.cards.every((c) => c.layoutType === 'IMAGE_FULL_WIDTH');
  const columns = hasImageCards ? 1 : section.columns;

  return (
    <section className="card-section" aria-label={title || undefined}>
      {title && <h2 className="card-section__title">{title}</h2>}
      <div className="card-grid" style={{ '--card-columns': columns }}>
        {section.cards.map((card) => <Card key={card.id} card={card} />)}
      </div>
    </section>
  );
}