import { useTranslation } from "react-i18next";
import "./styles/hospice.css"

function HospicePage(){
    const { t } = useTranslation();

    return(
        <main>
            <section class="HospiceBanner">
                <div class="HospiceBannerMiddle">
                    <div class="HospiceBlurb">
                        <div class="HospiceTitle">
                            <div class="HospiceIcon">
                                <svg class="HospiceHeart">
                                    <path d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5zM17 12c-3.9 0-7 3.1-7 7 0 5.1 3.2 8.5 15 18.1 11.8-9.6 15-13 15-18.1 0-3.9-3.1-7-7-7-3.5 0-5.4 2.1-6.9 3.8L25 17.1l-1.1-1.3C22.4 14.1 20.5 12 17 12z"/>
                                </svg>
                            </div>
                            <h1 class="HospiceTitleText">{t('hospice.blurb.title')}</h1>
                        </div>
                        <p class="HospiceDescription">{t('hospice.blurb.description')}</p>
                        <a href="/schedule" class="HospiceContactButton">{t('hospice.blurb.contactButton')}</a>
                    </div>
                </div>
            </section>
            <section class="UnderstandingHospiceSection">
                <h2 class="UnderstandingHospiceTitle">{t('hospice.understanding.title')}</h2>
                <div class="HospiceInformationCards">
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.understanding.cards.card1.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.understanding.cards.card1.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.understanding.cards.card2.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.understanding.cards.card2.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.understanding.cards.card3.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.understanding.cards.card3.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.understanding.cards.card4.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.understanding.cards.card4.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.understanding.cards.card5.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.understanding.cards.card5.description')}</p>
                        </div>
                    </div>
                </div>

            </section>
            <section class="HospiceCareAndBenefits">
                <h2 class="HospiceCareAndBenefitsTitle">{t('hospice.careAndBenefits.title')}</h2>
                <div class="HospiceInformationCards">
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card1.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card1.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card2.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card2.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card3.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card3.description.top')}</p>
                            <ul class="HospiceCardList">
                                <li class="HospiceCardListItem">{t('hospice.careAndBenefits.cards.card3.description.list1')}</li>
                                <li class="HospiceCardListItem">{t('hospice.careAndBenefits.cards.card3.description.list2')}</li>
                                <li class="HospiceCardListItem">{t('hospice.careAndBenefits.cards.card3.description.list3')}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card4.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card4.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card5.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card5.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.careAndBenefits.cards.card6.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.careAndBenefits.cards.card6.description.top')}</p>
                            <ul class="HospiceCardList">
                                <li class="HospiceCardListItem">{t('hospice.careAndBenefits.cards.card6.description.list1')}</li>
                                <li class="HospiceCardListItem">{t('hospice.careAndBenefits.cards.card6.description.list2')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section class="HospiceComprehensiveServices">
                <h2 class="HospiceComprehensiveServicesTitle">{t('hospice.comprehensiveServices.title')}</h2>
                <div class="HospiceInformationCards">
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card1.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card1.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card2.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card2.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card3.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card3.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card4.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card4.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card5.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card5.description')}</p>
                        </div>
                    </div>
                    <div class="HospiceInformationCard">
                        <div class="HospiceInformationCardTop">
                            <h3 class="HospiceInformationCardTitle">{t('hospice.comprehensiveServices.cards.card6.title')}</h3>
                        </div>
                        <div class="HospiceInformationCardBottom">
                            <p class="HospiceInformationCardText">{t('hospice.comprehensiveServices.cards.card6.description')}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="HospiceAboveAndBeyond">
                <div class="HospiceAboveAndBeyondMiddle">
                    <h2 class="HospiceAboveAndBeyondTitle">{t('hospice.aboveAndBeyond.title')}</h2>
                    <p class="HospiceAboveAndBeyondText">{t('hospice.aboveAndBeyond.description')}</p>
                    <div class="HospiceAboveAndBeyondCards">
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card1')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card2')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card3')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card4')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card5')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card6')}</span>
                        </div>
                        <div class="HospiceAboveAndBeyondCard">
                            <svg class="HospiceCheckmark">
                                <path fill="lightgrey" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path>
                            </svg>
                            <span class="HospiceAboveAndBeyondCardText">{t('hospice.aboveAndBeyond.cards.card7')}</span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="HospiceProcess">
                <div class="HospiceProcessMiddle">
                    <h2 class="HospiceProcessTitle">{t('hospice.hospiceProcess.title')}</h2>
                    <div class="HospiceProcessSteps">
                        <div class="HospiceProcessStep">
                            <div class="HospiceProcessCircle">{t('hospice.hospiceProcess.cards.card1.number')}</div>
                            <h3 class="HospiceProcessStepTitle">{t('hospice.hospiceProcess.cards.card1.title')}</h3>
                            <p class="HospiceProcessStepText">{t('hospice.hospiceProcess.cards.card1.description')}</p>
                        </div>
                        <div class="HospiceProcessStep">
                            <div class="HospiceProcessCircle">{t('hospice.hospiceProcess.cards.card2.number')}</div>
                            <h3 class="HospiceProcessStepTitle">{t('hospice.hospiceProcess.cards.card2.title')}</h3>
                            <p class="HospiceProcessStepText">{t('hospice.hospiceProcess.cards.card2.description')}</p>
                        </div>
                        <div class="HospiceProcessStep">
                            <div class="HospiceProcessCircle">{t('hospice.hospiceProcess.cards.card3.number')}</div>
                            <h3 class="HospiceProcessStepTitle">{t('hospice.hospiceProcess.cards.card3.title')}</h3>
                            <p class="HospiceProcessStepText">{t('hospice.hospiceProcess.cards.card3.description')}</p>
                        </div>
                        <div class="HospiceProcessStep">
                            <div class="HospiceProcessCircle">{t('hospice.hospiceProcess.cards.card4.number')}</div>
                            <h3 class="HospiceProcessStepTitle">{t('hospice.hospiceProcess.cards.card4.title')}</h3>
                            <p class="HospiceProcessStepText">{t('hospice.hospiceProcess.cards.card4.description')}</p>
                        </div>
                        <div class="HospiceProcessStep">
                            <div class="HospiceProcessCircle">{t('hospice.hospiceProcess.cards.card5.number')}</div>
                            <h3 class="HospiceProcessStepTitle">{t('hospice.hospiceProcess.cards.card5.title')}</h3>
                            <p class="HospiceProcessStepText">{t('hospice.hospiceProcess.cards.card5.description')}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="HospiceContact">
                <div class="HospiceContactMiddle">
                    <h2 class="HospiceContactTitle">{t('hospice.hospiceContact.title')}</h2>
                    <p class="HospiceContactText">{t('hospice.hospiceContact.description')}</p>
                    <div class="HospiceContactButtons">
                        <a href="/schedule" class="HospiceContactButton">{t('hospice.hospiceContact.contactButton')}</a>
                        <a href="/" class="HospiceHomeButton">{t('hospice.hospiceContact.homeButton')}</a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default HospicePage;