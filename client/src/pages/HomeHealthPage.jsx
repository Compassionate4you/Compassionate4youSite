import { useTranslation } from 'react-i18next';
import "../styles/homehealth.css";

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
                        <div className="hero-icon">🏠</div>
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
                        <div className="service-icon">👩‍⚕️</div>
                        <h3>{t('homeHealth.services.doctors')}</h3>
                        <p>{t('homeHealth.services.doctorsDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">💊</div>
                        <h3>{t('homeHealth.services.pt')}</h3>
                        <p>{t('homeHealth.services.ptDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">🏋️</div>
                        <h3>{t('homeHealth.services.ot')}</h3>
                        <p>{t('homeHealth.services.otDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">👩‍⚕️</div>
                        <h3>{t('homeHealth.services.nurses')}</h3>
                        <p>{t('homeHealth.services.nursesDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">💬</div>
                        <h3>{t('homeHealth.services.st')}</h3>
                        <p>{t('homeHealth.services.stDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">👨‍⚕️</div>
                        <h3>{t('homeHealth.services.chha')}</h3>
                        <p>{t('homeHealth.services.chhaDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">👩‍💼</div>
                        <h3>{t('homeHealth.services.msw')}</h3>
                        <p>{t('homeHealth.services.mswDesc')}</p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">🌐</div>
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
        </main>
    );
}

export default HomeHealthPage;