import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import "../styles/homehealth.css";
import CardSection from "../components/modular/CardSection";

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
    const navigate = useNavigate();

    // Lists come from the translation files so they change with the language
    const advantages = t('homeHealthPage.advantages', { returnObjects: true });
    const specialties = t('homeHealthPage.specialties', { returnObjects: true });

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

                    <button
                         className="hero-button"
                         onClick={() => navigate("/schedule")}
                    >
                         {t('homeHealthPage.scheduleConsultation')}
                    </button>

                </div>

            </section>

            {/* SERVICES SECTION */}
            <section className="services-section">
                <h2 className="services-title">
                    {t('homeHealth.servicesHeading')}</h2>

                <CardSection slug="homehealth-services" />

            </section>

            {/* ADVANTAGES SECTION */}
            <section className="advantages-section">
                <h2 className="advantages-title">{t('homeHealthPage.advantagesTitle')}</h2>

                <div className="advantages-grid">
                    {advantages.map((text, index) => (
                        <div key={index} className="adv-card">
                            <div className="adv-number">{index + 1}</div>
                            <p className="adv-text">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SPECIALTY SECTION */}
            <section className="specialty-section">
                <h2 className="specialty-title">{t('homeHealthPage.specialtyTitle')}</h2>

                <div className="specialty-grid">
                    {specialties.map((text, index) => (
                        <div key={index} className="specialty-card">
                            <div className="specialty-icon"><HeartIcon /></div>
                            <p className="specialty-text">{text}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* CTA SECTION */}
            <section className="cta-section">
                <h2 className="cta-title">{t('homeHealthPage.ctaTitle')}</h2>

                <p className="cta-description">{t('homeHealthPage.ctaDescription')}</p>

                <div className="cta-buttons">
                    <button
                        className="cta-primary"
                        onClick={() => navigate("/schedule")}
                    >
                        {t('homeHealthPage.ctaSchedule')}
                    </button>
                    <button
                        className="cta-secondary"
                        onClick={() => navigate("/")}
                    >
                        {t('homeHealthPage.ctaBack')}
                    </button>
                </div>
            </section>

            {/* Task: DT-508
            Author: PBall
            Sprint: Sprint 6 */}

            {/* DYNAMIC SECTION INGESTION (COMMENTED OUT PER CODE CONSIDERATIONS)
            Uncomment once dynamic publishing schema is finalized. */}

            {/* {modularSections.map((section) => (
                <DynamicSectionRenderer key={section.id} config={section} />
            ))} */}

        </main>
    );
}

export default HomeHealthPage;