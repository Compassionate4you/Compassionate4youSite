export default function CardBody({ text }) {
  return splitParagraph(text).map((b, i) =>
    b.type === 'list' ? (
      <ul key={i} className="card-list">{b.items.map((li, j) => <li key={j}>{li}</li>)}</ul>
    ) : (
      <p key={i}>{b.text}</p>
    )
  );
}

export function splitParagraph(text) {
  const lines = String(text).split('\n').filter((l) => l.trim());
  const blocks = [];
  let list = null;
  lines.forEach((line) => {
    if (line.startsWith('- ')) {
      if (!list) { list = []; blocks.push({ type: 'list', items: list }); }
      list.push(line.slice(2));
    } else {
      list = null;
      blocks.push({ type: 'p', text: line });
    }
  });
  return blocks;
}

export function pickText(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const short = (lang || 'en').split('-')[0];
  return value[short] || value.en || '';
}