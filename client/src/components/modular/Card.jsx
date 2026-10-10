import { useTranslation } from 'react-i18next';
import ImageCard from './ImageCard';
import HeaderParagraphCard from './HeaderParagraphCard';
import HeaderSymbolCard from './HeaderSymbolCard';
import { pickText } from './cardText';

export default function Card({ card }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const common = {
    header: pickText(card.header, lang),
    paragraph: pickText(card.paragraph, lang),
    imageUrl: card.imageUrl,
    imageAlt: pickText(card.imageAlt, lang),
    symbol: card.symbol,
    alignment: card.alignment,
  };
  switch (card.layoutType) {
    case 'IMAGE_FULL_WIDTH': return <ImageCard {...common} />;
    case 'HEADER_SYMBOL': return <HeaderSymbolCard {...common} />;
    case 'HEADER_PARAGRAPH':
    default: return <HeaderParagraphCard {...common} />;
  }
}