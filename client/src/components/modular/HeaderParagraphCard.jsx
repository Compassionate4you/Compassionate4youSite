import CardBody from './CardBody';

// Layout 2: header with paragraph.
export default function HeaderParagraphCard({ header, paragraph, alignment }) {
  return (
    <article className={`card card--text card--align-${alignment || 'left'}`}>
      <h3>{header}</h3>
      <CardBody text={paragraph} />
    </article>
  );
}