import Navbar from "../components/layout/Navbar";
import "./landing.css";

function LandingPage() {
  return (
    <div>
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <h1>Compassionate Care for Your Loved Ones</h1>
          <p>
            Professional home health and hospice services dedicated to providing
            quality care with dignity and respect.
          </p>
        </div>

        <div className="hero-right">
          <img
            src="https://via.placeholder.com/500"
            alt="care"
          />
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="philosophy">
        <h2>Our Philosophy</h2>
        <p>
          We believe in treating our patients with dignity, respect, and empathy.
          We strive to make their end-of-life journey as comfortable and meaningful
          as possible.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>Caring Since 2021</p>
        <p>About</p>
        <p>Contact</p>
      </footer>
    </div>
  );
}

export default LandingPage;