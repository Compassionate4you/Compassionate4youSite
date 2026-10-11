import { Link } from "react-router-dom";
import "../styles/notfound.css";

export default function NotFoundPage() {
  return (
    <section className="notfound-section">
      <div className="notfound-section__inner">
        <p className="notfound-section__code">404</p>
        <h1 className="notfound-section__title">Page not found</h1>
        <p className="notfound-section__message">
          Sorry, we couldn't find the page you're looking for. It may have
          been moved, renamed, or doesn't exist.
        </p>
        <Link to="/" className="notfound-section__home-link">
          Return to homepage
        </Link>
      </div>
    </section>
  );
}