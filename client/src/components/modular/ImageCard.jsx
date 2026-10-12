import CardBody from './CardBody';

// Layout 1: full width with image. alignment "left" puts the image on the left, "right" on the right.
export default function ImageCard({ header, paragraph, imageUrl, imageAlt, alignment }) {
  return (
    <article className={`card card--image card--image-${alignment === 'right' ? 'right' : 'left'}`}>
      {imageUrl && <img className="card__image" src={imageUrl} alt={imageAlt || ''} />}
      <div className="card__content">
        <h3>{header}</h3>
        <CardBody text={paragraph} />
      </div>
    </article>
  );
}