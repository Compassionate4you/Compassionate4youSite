import "../styles/HospicePage.css";

function HospicePage() {
  return (
    <div className="hospice-page">
      <section className="hospice-hero">
        <div className="hospice-hero-left">
          <h1>Compassionate Hospice Care</h1>
          <p>
            We provide end-of-life care focused on comfort, dignity, and
            emotional support for patients and their families.
          </p>
        </div>

        <div className="hospice-hero-right">
          <img
            src="https://via.placeholder.com/500"
            alt="hospice care"
          />
        </div>
      </section>

      <section className="hospice-services">
        <h2>Our Hospice Services</h2>
        <ul>
          <li>Pain and symptom management</li>
          <li>Emotional and spiritual support</li>
          <li>Family counseling and guidance</li>
          <li>24/7 on-call support</li>
        </ul>
      </section>

      <section className="hospice-philosophy">
        <h2>Our Approach</h2>
        <p>
          Our hospice care team works closely with patients and families to
          ensure comfort, respect, and personalized care during every stage
          of the journey.
        </p>
      </section>
    </div>
  );
}

export default HospicePage;