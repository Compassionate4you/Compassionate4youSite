import { Heart, Check, Home, Stethoscope, Users, Phone, Pill, Activity, Star, Shield } from 'lucide-react';

const ICONS = { heart: Heart, check: Check, home: Home, stethoscope: Stethoscope, users: Users, phone: Phone, pill: Pill, activity: Activity, star: Star, shield: Shield };
export const SYMBOL_NAMES = Object.keys(ICONS);

// Layout 3: header with a symbol. Symbol is an icon name above, or any emoji/character.
export default function HeaderSymbolCard({ header, symbol, alignment }) {
  const Icon = ICONS[(symbol || '').toLowerCase()];
  return (
    <article className={`card card--symbol card--align-${alignment || 'center'}`}>
      <div className="card__symbol" aria-hidden="true">{Icon ? <Icon size={32} /> : symbol}</div>
      <h3>{header}</h3>
    </article>
  );
}