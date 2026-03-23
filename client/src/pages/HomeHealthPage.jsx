import React from "react";

function HomeHealthPage() {
    return (
        <main>

            {/* HERO SECTION */}
            <section>
                <h1>Home Health</h1>
                <p>
                    Professional healthcare services delivered in the comfort and safety of your home, promoting independence and quality of life.
                </p>
            </section>

            {/* SERVICES SECTION */}
            <section>
                <h2>Our Home Health Services</h2>

                <div className="services-container">

                    <div className="service-card">
                        <h3>Medical Doctors</h3>
                        <p>Our MDs develop and review care plans, manage symptoms, and act as a medical resource.</p>
                    </div>

                    <div className="service-card">
                        <h3>Physical Therapists (PT & PTA)</h3>
                        <p>Help patients maintain mobility, manage pain, and improve quality of life.</p>
                    </div>

                    <div className="service-card">
                        <h3>Occupational Therapists (OT)</h3>
                        <p>Assist patients in maintaining independence in daily activities.</p>
                    </div>

                    <div className="service-card">
                        <h3>Skilled Nurses (RN, LVN)</h3>
                        <p>Collaborate with physicians and provide medical care at home.</p>
                    </div>

                    <div className="service-card">
                        <h3>Speech Therapists (ST)</h3>
                        <p>Help patients improve communication, swallowing, and cognitive function.</p>
                    </div>

                    <div className="service-card">
                        <h3>Certified Home Health Aide (CHHA)</h3>
                        <p>Assist with daily activities like bathing, dressing, and meal prep.</p>
                    </div>

                    <div className="service-card">
                        <h3>Medical Social Workers (MSW)</h3>
                        <p>Provide emotional support and connect patients with community resources.</p>
                    </div>

                    <div className="service-card">
                        <h3>Multi-Lingual</h3>
                        <p>Services available in multiple languages to support diverse patient needs.</p>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default HomeHealthPage;