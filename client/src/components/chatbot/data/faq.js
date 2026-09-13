// DT-419: FAQ question bank.
//
// Answers are provisional drafts pending the client's approved wording
// (DT-418). Keep the questions, keywords, and links - replace the `answer`
// strings once the client's list arrives.

export const faq = [
    {
        id: 'services-offered',
        question: 'What services do you offer?',
        keywords: ['services', 'offer', 'provide', 'what do you do', 'care types'],
        answer:
            'We provide home health care and hospice care. Our Home Health page has the full list of services.',
        link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health' },
    },
    {
        id: 'service-area',
        question: 'What areas do you serve?',
        keywords: ['area', 'areas', 'location', 'locations', 'serve', 'where', 'city', 'county'],
        answer:
            'We serve the Sacramento area. Our Locations page lists where we currently provide care.',
        link: { labelKey: 'chatbot.faqLinks.locations', to: '/locations' },
    },
    {
        id: 'schedule-appointment',
        question: 'How do I schedule an appointment?',
        keywords: ['schedule', 'appointment', 'book', 'booking', 'visit', 'consultation'],
        answer:
            'You can request an appointment from our scheduling page, and our staff will follow up to confirm.',
        link: { labelKey: 'chatbot.faqLinks.schedule', to: '/schedule' },
    },
    {
        id: 'home-health-vs-hospice',
        question: 'What is the difference between home health and hospice?',
        keywords: ['difference', 'home health vs', 'hospice vs', 'compare', 'which one'],
        answer:
            'They serve different needs, and the right choice depends on your situation. Our Hospice page explains more, and our staff can talk it through with you.',
        link: { labelKey: 'chatbot.faqLinks.hospice', to: '/hospice' },
    },
    {
        id: 'cost-insurance',
        question: 'How much does it cost, and do you take insurance?',
        keywords: ['cost', 'price', 'pay', 'insurance', 'medicare', 'medicaid', 'coverage'],
        answer:
            'Coverage depends on your plan and the type of care. Please contact our office and our staff will go over the details with you.',
        link: null,
    },
    {
        id: 'contact',
        question: 'How do I contact you?',
        keywords: ['contact', 'phone', 'call', 'email', 'reach', 'talk to someone'],
        answer:
            'Our Locations page has the phone number and address for each of our offices.',
        link: { labelKey: 'chatbot.faqLinks.locations', to: '/locations' },
    },
    {
        id: 'getting-started',
        question: 'How do we get started with care?',
        keywords: ['get started', 'getting started', 'begin', 'first step', 'sign up', 'refer'],
        answer:
            'Getting started usually begins with a conversation about what you need. Request an appointment and our staff will walk you through the next steps.',
        link: { labelKey: 'chatbot.faqLinks.schedule', to: '/schedule' },
    },
    {
        id: 'who-qualifies',
        question: 'Who qualifies for your services?',
        keywords: ['qualify', 'qualifies', 'eligible', 'eligibility', 'requirements', 'who can'],
        answer:
            'Eligibility depends on each person’s situation and their doctor’s guidance. Our staff can review your circumstances with you directly.',
        link: null,
    },
    {
        id: 'who-provides-care',
        question: 'Who will be providing the care?',
        keywords: [
            'who will be providing',
            'who provides',
            'caregiver',
            'nurse',
            'staff',
            'team',
            'aide',
            'therapist',
        ],
        answer:
            'Care is delivered by our clinical team. Our Home Health page describes the kinds of care our staff provide.',
        link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health' },
    },
    {
        id: 'care-at-home',
        question: 'Do you provide care at home?',
        keywords: [
            'provide care at home',
            'care at home',
            'at home',
            'in home',
            'my house',
            'come to me',
            'home visit',
        ],
        answer:
            'Yes, our services are provided where you live. Our Home Health page has more detail on what that looks like.',
        link: { labelKey: 'chatbot.faqLinks.homeHealth', to: '/home-health' },
    },
    {
        id: 'hours-availability',
        question: 'What are your hours?',
        keywords: ['hours', 'open', 'availability', 'weekend', 'after hours', 'when are you'],
        answer:
            'Please contact our office for current hours and availability. Our Locations page lists how to reach each office.',
        link: { labelKey: 'chatbot.faqLinks.locations', to: '/locations' },
    },
    {
        id: 'family-support',
        question: 'Do you offer support for family members?',
        keywords: [
            'family',
            'families',
            'caregiver support',
            'support for me',
            'relatives',
            'loved one',
        ],
        answer:
            'Support for families is part of how we work. Our staff can explain what support is available in your situation.',
        link: { labelKey: 'chatbot.faqLinks.hospice', to: '/hospice' },
    },
];

export default faq;
