import { useTranslation } from 'react-i18next';

function HomeHealthPage() {
    const { t } = useTranslation();

    return (
        <main>

            {/* HERO SECTION */}
            <section>
                <h1>{t('homeHealth.title')}</h1>
                <p>{t('homeHealth.subtitle')}</p>
            </section>

            {/* SERVICES SECTION */}
            <section>
                <h2>{t('homeHealth.servicesHeading')}</h2>

                <div className="services-container">

                    <div className="service-card">
                        <h3>{t('homeHealth.services.doctors')}</h3>
                        <p>{t('homeHealth.services.doctorsDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.pt')}</h3>
                        <p>{t('homeHealth.services.ptDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.ot')}</h3>
                        <p>{t('homeHealth.services.otDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.nurses')}</h3>
                        <p>{t('homeHealth.services.nursesDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.st')}</h3>
                        <p>{t('homeHealth.services.stDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.chha')}</h3>
                        <p>{t('homeHealth.services.chhaDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.msw')}</h3>
                        <p>{t('homeHealth.services.mswDesc')}</p>
                    </div>

                    <div className="service-card">
                        <h3>{t('homeHealth.services.multilingual')}</h3>
                        <p>{t('homeHealth.services.multilingualDesc')}</p>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default HomeHealthPage;