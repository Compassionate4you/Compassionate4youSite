import { useTranslation } from 'react-i18next';
import "../styles/homehealth.css";

const HeartIcon = () => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2f7d5c"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.5 4.75C17.24 2.9 13.95 3.5 12 6.1C10.05 3.5 6.76 2.9 4.5 4.75C1.9 6.88 2.1 10.7 4.25 13.1L12 21L19.75 13.1C21.9 10.7 22.1 6.88 19.5 4.75Z" />
    </svg>
);


const HomeIcon = () => (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
    </svg>
);


function HomeHealthPage() {
    const { t } = useTranslation();
    const advantages = [
                        "We manage all employer obligations in payroll, taxes and compensation",
                        "More cost efficient than hospitalization",
                        "Faster rate of client recovery",
                        "Clients have the right to participate in their plan of care",
                        "Services are rendered in the clients place of residence",
                        "Avoidance of hospital acquired infections",
                        "Care transition, fall prevention and medical equipment training"

                    ];

    return (
        <main>

            {/* HERO SECTION */}
            <section className="hero-section">

                <div className="hero-overlay"></div>

                <div className="hero-content">

                    <div className="hero-title-row">
                        <div className="hero-icon"><HomeIcon /></div>
                        <h1>{t('homeHealth.title')}</h1>
                    </div>

                    <p className="hero-description">
                        {t('homeHealth.subtitle')}
                    </p>

                    <button className="hero-button">
                        Schedule a Consultation
                    </button>

                </div>

            </section>

            {/* SERVICES SECTION */}
            <section className="services-section">
                <h2 className="services-title">
                    {t('homeHealth.servicesHeading')}</h2>

                <div className="services-container">

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.doctors')}</h3>
                        <p>{t('homeHealth.services.doctorsDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.pt')}</h3>
                        <p>{t('homeHealth.services.ptDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.ot')}</h3>
                        <p>{t('homeHealth.services.otDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.nurses')}</h3>
                        <p>{t('homeHealth.services.nursesDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.st')}</h3>
                        <p>{t('homeHealth.services.stDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.chha')}</h3>
                        <p>{t('homeHealth.services.chhaDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.msw')}</h3>
                        <p>{t('homeHealth.services.mswDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon"><HeartIcon /></div>
                        <h3>{t('homeHealth.services.multilingual')}</h3>
                        <p>{t('homeHealth.services.multilingualDesc')}</p>
                    </div>

                </div>

            </section>
            {/* ADVANGATES SECTION */}
            <section className= "advantages-section">
                <h2 className="advantages-title">Home Health Advantages</h2>

                <div className="advantages-grid">
                    {advantages.map((text,index) => (
                        <div key={index} className="adv-card">
                            <div className="adv-number">{index +1}</div>
                            <p className="adv-text">{text}</p>
                        </div>
                    ))}
                ))
                </div>
            </section>

            {/*SPECUALTY SECTION*/}
            <section className="specialty-section">
                <h2 className="specialty-title">Speciatly Services</h2>

                <div className="specialty-grid">
                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">CHF</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">COPD</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Orthopedic Post-Surgical Therapy (Joint Replacement</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Wound Care</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">I.V. Infusion</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Physical, Occupational, Speech Therapy</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Medication Management</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Catheter Care</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Diet, Excercise, Nutrition Education</p>
                    </div>

                    <div className="specialty-card">
                        <div className="specialty-icon"><HeartIcon /></div>
                        <p className="specialty-text">Labs (PT/INR, Blood Draw)</p>
                    </div>
                </div>
            </section>


            {/*CTA SECTIOn*/}
            <section className="cta-section">
                <h2 className="cta-title">Start Your Home Health Care Today</h2>

                <p className="cta-description">Let us help you or your loved one receive the quality care you deserve in the comfort of your home.</p>

                <div className="cta-buttons">
                    <button className="cta-primary">Schedule Appointment</button>
                    <button className="cta-secondary">Back to Home</button>
                </div>
            </section>
        </main>
    );
}

export default HomeHealthPage;