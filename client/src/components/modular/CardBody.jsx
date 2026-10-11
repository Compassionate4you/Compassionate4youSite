import { splitParagraph } from './cardText';

export default function CardBody({ text }) {
  return splitParagraph(text).map((b, i) =>
    b.type === 'list' ? (
      <ul key={i} className="card-list">{b.items.map((li, j) => <li key={j}>{li}</li>)}</ul>
    ) : (
      <p key={i}>{b.text}</p>
    )
  );
}