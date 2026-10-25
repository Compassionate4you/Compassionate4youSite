import { useTranslation } from "react-i18next";
import "../styles/HospicePage.css"
import CardSection from "../components/modular/CardSection";
import useSection from "../hooks/useSection";
import { pickText } from "../components/modular/cardText";

function HospiceAboveAndBeyondItems() {
    const { i18n } = useTranslation();
    const { section, loading, error } = useSection("hospice-above-beyond-items");

    if (error) console.error("HospiceAboveAndBeyondItems failed:", error);
    if (loading || error || !section?.cards?.length) return null;

    return (
        <div className="HospiceAboveAndBeyondCards">
            {section.cards.map((card) => (
                <div className="card-surface HospiceAboveAndBeyondCard" key={card.id}>
                    <svg className="HospiceCheckmark">
                        <path fill="#366454" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                    </svg>
                    <span className="HospiceAboveAndBeyondCardText">
                        {pickText(card.header, i18n.language)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function HospiceCareProcessSteps() {
    const { i18n } = useTranslation();
    const { section, loading, error } = useSection("hospice-care-process");

    if (error) console.error("HospiceCareProcessSteps failed:", error);
    if (loading || error || !section?.cards?.length) return null;

    return (
        <div className="HospiceProcessSteps">
            {section.cards.map((card, index) => (
                <div className="HospiceProcessStep" key={card.id}>
                    <div className="HospiceProcessCircle">{card.symbol || index + 1}</div>
                    <h3 className="HospiceProcessStepTitle">
                        {pickText(card.header, i18n.language)}
                    </h3>
                    <p className="HospiceProcessStepText">
                        {pickText(card.paragraph, i18n.language)}
                    </p>
                </div>
            ))}
        </div>
    );
}

function HospicePage(){
    const { t } = useTranslation();

    return(
        <main>
            <section className="HospiceBanner">
                <div className="HospiceBannerMiddle">
                    <div className="HospiceBlurb">
                        <div className="HospiceTitle">
                            <div className="HospiceIcon">
                                ❤️
                            </div>
                            <h1 className="HospiceTitleText">{t('hospice.blurb.title')}</h1>
                        </div>
                        <p className="HospiceDescription">{t('hospice.blurb.description')}</p>
                        <a href="/schedule" className="HospiceContactButton">{t('hospice.blurb.contactButton')}</a>
                    </div>
                </div>
            </section>
            <CardSection slug="hospice-understanding" className="card-section--hover" />
            <CardSection slug="hospice-care-benefits" className="card-section--hover" />
            <CardSection slug="hospice-comprehensive" className="card-section--hover" />
            <section className="HospiceAboveAndBeyond">
                <div className="HospiceAboveAndBeyondMiddle">
                    <h2 className="HospiceAboveAndBeyondTitle">{t('hospice.aboveAndBeyond.title')}</h2>
                    <p className="HospiceAboveAndBeyondText">{t('hospice.aboveAndBeyond.description')}</p>
                    <HospiceAboveAndBeyondItems />
                </div>
            </section>
            <section className="HospiceProcess">
                <div className="HospiceProcessMiddle">
                    <h2 className="HospiceProcessTitle">{t('hospice.hospiceProcess.title')}</h2>
                    <HospiceCareProcessSteps />
                </div>
            </section>
            <section className="HospiceContact">
                <div className="HospiceContactMiddle">
                    <h2 className="HospiceContactTitle">{t('hospice.hospiceContact.title')}</h2>
                    <p className="HospiceContactText">{t('hospice.hospiceContact.description')}</p>
                    <div className="HospiceContactButtons">
                        <a href="/schedule" className="HospiceContactButton">{t('hospice.hospiceContact.contactButton')}</a>
                        <a href="/" className="HospiceHomeButton">{t('hospice.hospiceContact.homeButton')}</a>
                    </div>
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

export default HospicePage;
