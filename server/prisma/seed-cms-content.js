// DT-622 DT-618 Sprint 8
// Preston Ball
// Database migration and seeding script populating Landing, Home Health, and Hospice content models

require('dotenv').config()
const prisma = require('../src/config/db')

async function main () {
  console.log('--- Starting CMS Content & Modular Architecture Seeding ---')

  // 1. Theme Color Tokens
  const colors = [
    { id: 'primary-green', lightModeColor: '#366454', darkModeColor: '#4ade80' },
    { id: 'brand-dark', lightModeColor: '#0f172a', darkModeColor: '#f8fafc' },
    { id: 'surface-white', lightModeColor: '#ffffff', darkModeColor: '#1e293b' },
    { id: 'surface-light', lightModeColor: '#f8fafc', darkModeColor: '#0f172a' },
    { id: 'text-main', lightModeColor: '#1e293b', darkModeColor: '#f8fafc' },
    { id: 'text-muted', lightModeColor: '#64748b', darkModeColor: '#94a3b8' },
    { id: 'accent-gold', lightModeColor: '#d97706', darkModeColor: '#fbbf24' },
    { id: 'divider-gray', lightModeColor: '#e2e8f0', darkModeColor: '#334155' }
  ]

  for (const c of colors) {
    await prisma.color.upsert({
      where: { id: c.id },
      create: c,
      update: c
    })
  }
  console.log(`✓ Seeded ${colors.length} theme colors`)

  // 2. Modular Cards (with content.colors)
  const defaultCardColors = {
    backgroundColor: 'surface-white',
    headerColor: 'brand-dark',
    textColor: 'text-main'
  }

  const cards = [
    // Landing Cards
    {
      id: 'card-medicare-criteria',
      layout: 'IMAGE_FULL_WIDTH',
      content: {
        header: 'Medicare Home Health Criteria',
        paragraph: 'To qualify for Medicare home health services, a patient must be confined to the home and be under physician care who is a doctor of medicine, a doctor of osteopathy, or a doctor of podiatric medicine, and enrolled in the Medicare Program.',
        imageUrl: '/images/working_a_puzzle_together.jpeg',
        imageAlt: 'People working on a puzzle together',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-specialty-services',
      layout: 'IMAGE_FULL_WIDTH',
      content: {
        header: 'Specialty Services',
        paragraph: 'To provide comprehensive, high quality home-care services to our patients by creating strong partnerships with their families, case managers, discharge planners and physicians.\n\nWe believe in creating a team of caring professionals whose goal is the care and support of our patients.',
        imageUrl: '/images/older_couple_smiling.jpeg',
        imageAlt: 'Older couple smiling together',
        alignment: 'right',
        colors: defaultCardColors
      }
    },

    // Home Health Service Cards
    {
      id: 'card-hh-doctors',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Medical Doctors',
        paragraph: 'Physician oversight ensuring tailored treatment plans, ongoing progress evaluations, and close collaboration with primary care providers.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-pt',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Physical Therapy',
        paragraph: 'Targeted physical rehabilitation focusing on mobility, gait training, balance, strength restoration, and fall prevention.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-ot',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Occupational Therapy',
        paragraph: 'Personalized therapies restoring independence in daily activities, adaptive equipment education, and home environment safety adjustments.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-nurses',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Skilled Nursing',
        paragraph: 'Registered nurses delivering wound management, medication administration, intravenous therapies, and comprehensive chronic disease monitoring.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-st',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Speech Therapy',
        paragraph: 'Speech-language pathologists assisting with cognitive communication, swallowing disorders, and speech restoration.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-chha',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Home Health Aides',
        paragraph: 'Compassionate assistance with bathing, personal hygiene, dressing, and essential routine care under nurse supervision.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-msw',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Medical Social Work',
        paragraph: 'Guidance navigating healthcare resources, emotional counseling, community support systems, and advance healthcare directives.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-multilingual',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Multilingual Care',
        paragraph: 'Fluent clinical staff offering care in English, Spanish, Punjabi, Urdu, Hindi, Mandarin, and Vietnamese to serve diverse families comfortably.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },

    // Home Health Advantage Cards
    {
      id: 'card-hh-adv-1',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Personalized Care Plans',
        symbol: 'ShieldCheck',
        alignment: 'center',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-adv-2',
      layout: 'HEADER_SYMBOL',
      content: {
        header: '24/7 Clinical On-Call Support',
        symbol: 'Phone',
        alignment: 'center',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-adv-3',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Seamless Hospital-to-Home Transition',
        symbol: 'Home',
        alignment: 'center',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-adv-4',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Physician Collaboration',
        symbol: 'Stethoscope',
        alignment: 'center',
        colors: defaultCardColors
      }
    },

    // Home Health Specialty Cards
    {
      id: 'card-hh-spec-1',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Cardiopulmonary Disease Care',
        symbol: 'Activity',
        alignment: 'center',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-spec-2',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Orthopedic Post-Surgical Rehab',
        symbol: 'Award',
        alignment: 'center',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hh-spec-3',
      layout: 'HEADER_SYMBOL',
      content: {
        header: 'Neurological & Stroke Recovery',
        symbol: 'Heart',
        alignment: 'center',
        colors: defaultCardColors
      }
    },

    // Hospice Understanding Cards
    {
      id: 'card-hosp-under-1',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Comfort-Centered Philosophy',
        paragraph: 'Focusing on quality of life, pain alleviation, and emotional tranquility rather than curative intervention.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-under-2',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Family & Caregiver Support',
        paragraph: 'Providing respite care, grief counseling, and practical caregiving guidance for loved ones every step of the journey.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-under-3',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Comprehensive Coverage',
        paragraph: '100% covered under Medicare Part A, Medi-Cal, and most major insurance plans with zero out-of-pocket medication or equipment costs.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },

    // Hospice Care Benefit Cards
    {
      id: 'card-hosp-ben-1',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Medication & Equipment Included',
        paragraph: 'All pain medications, symptom management drugs, hospital beds, oxygen, and mobility aids delivered directly to the home.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-ben-2',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Continuous Care During Crises',
        paragraph: 'Short-term around-the-clock nursing care in the home during acute symptom flares to avoid stressful hospital visits.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-ben-3',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Bereavement Support',
        paragraph: 'Comprehensive grief counseling and support groups provided for families for up to 13 months following a loss.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },

    // Hospice Comprehensive Services
    {
      id: 'card-hosp-comp-1',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Medical & Nursing Oversight',
        paragraph: 'Physicians and hospice registered nurses dedicated to managing comfort, pain, and respiratory symptoms.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-comp-2',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Spiritual & Emotional Counseling',
        paragraph: 'Chaplains and counselors honoring all cultural traditions and faith backgrounds to bring peace of mind.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },
    {
      id: 'card-hosp-comp-3',
      layout: 'HEADER_PARAGRAPH',
      content: {
        header: 'Volunteer Companionship',
        paragraph: 'Trained volunteers offering friendly visits, reading, musical comfort, and caregiver respite.',
        alignment: 'left',
        colors: defaultCardColors
      }
    },

    // Hospice Above & Beyond
    {
      id: 'card-hosp-ab-1',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Rapid 2-Hour Admission', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-2',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Same-Day Medication Delivery', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-3',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Dedicated On-Call Clinicians', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-4',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Personalized Music Therapy', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-5',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Veteran-Centric Hospice Care', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-6',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Pet Therapy Visits', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-ab-7',
      layout: 'HEADER_SYMBOL',
      content: { header: 'Multi-Language Translation Staff', symbol: 'Check', alignment: 'center', colors: defaultCardColors }
    },

    // Hospice Care Process Steps
    {
      id: 'card-hosp-step-1',
      layout: 'HEADER_SYMBOL',
      content: { header: '1. Initial Consultation', symbol: '1', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-step-2',
      layout: 'HEADER_SYMBOL',
      content: { header: '2. Clinical Assessment', symbol: '2', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-step-3',
      layout: 'HEADER_SYMBOL',
      content: { header: '3. Personalized Care Plan', symbol: '3', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-step-4',
      layout: 'HEADER_SYMBOL',
      content: { header: '4. Ongoing Comfort Visits', symbol: '4', alignment: 'center', colors: defaultCardColors }
    },
    {
      id: 'card-hosp-step-5',
      layout: 'HEADER_SYMBOL',
      content: { header: '5. Continuous Family Support', symbol: '5', alignment: 'center', colors: defaultCardColors }
    }
  ]

  for (const card of cards) {
    await prisma.userCreatedCard.upsert({
      where: { id: card.id },
      create: {
        id: card.id,
        layout: card.layout,
        content: card.content
      },
      update: {
        layout: card.layout,
        content: card.content
      }
    })
  }
  console.log(`✓ Seeded ${cards.length} modular cards`)

  // 3. Modular Sections (with content.colors)
  const defaultSectionColors = {
    backgroundColor: 'surface-white',
    headerColor: 'brand-dark',
    textColor: 'text-main',
    accentColor: 'primary-green'
  }
  const altSectionColors = {
    backgroundColor: 'surface-light',
    headerColor: 'brand-dark',
    textColor: 'text-main',
    accentColor: 'primary-green'
  }

  const sections = [
    // Landing Sections
    {
      id: 'sec-landing-hero',
      layout: 'IMAGE_HEADER_TEXT',
      content: {
        header: 'Compassionate Home Health & Hospice',
        text: 'Providing personalized, high-quality in-home healthcare and compassionate hospice support to help you and your loved ones thrive with dignity.',
        imageUrl: '/assets/images/CareImage1.jpeg',
        imageAlt: 'Compassionate patient care',
        buttonText: 'Schedule a Consultation',
        buttonLink: '/schedule',
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-landing-philosophy',
      layout: 'HEADER_TEXT',
      content: {
        header: 'Our Philosophy',
        text: 'We believe every individual deserves compassionate, dignified care in the comfort and familiarity of their own home. Our dedicated team of clinicians and caregivers partners closely with families and physicians to ensure seamless, heartfelt support.',
        colors: altSectionColors
      }
    },
    {
      id: 'sec-landing-caring',
      layout: 'HEADER_TEXT',
      content: {
        header: 'Caring for Our Community Since 2021',
        text: 'From clinical rehabilitation to compassionate end-of-life care, our multidisciplinary team brings hospital-grade expertise right to your doorstep.',
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-landing-info-cards',
      layout: 'CARD_GRID',
      content: {
        header: 'Our Clinical Standards & Specialty Services',
        gridCols: 1,
        cardIds: ['card-medicare-criteria', 'card-specialty-services'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-landing-about',
      layout: 'HEADER_TEXT',
      content: {
        header: 'About Compassionate Home Health & Hospice',
        text: 'We are licensed healthcare professionals committed to delivering tailored medical, rehabilitative, and supportive services across Contra Costa and surrounding communities.',
        colors: altSectionColors
      }
    },
    {
      id: 'sec-landing-contact',
      layout: 'CONTACT_FORM',
      content: {
        header: 'Contact Us',
        phone: '(925) 954-4441',
        email: 'info@compassionate4you.com',
        fax: '(925) 954-4442',
        addressLine1: '1501 N Broadway, Ste 350A/B',
        addressLine2: 'Walnut Creek, CA 94596',
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-landing-map',
      layout: 'MAP_SECTION',
      content: {
        header: 'Visit Our Walnut Creek Office',
        mapAddress: '1501 N Broadway, Ste 350A/B, Walnut Creek, CA 94596',
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.6!2d-122.0651!3d37.9101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808561234567890%3A0xabcdef!2s1501+N+Broadway+Ste+350%2C+Walnut+Creek%2C+CA+94596!5e0!3m2!1sen!2sus!4v1700000000000',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=1501+N+Broadway+Ste+350,+Walnut+Creek,+CA+94596',
        colors: altSectionColors
      }
    },
    {
      id: 'sec-landing-faq',
      layout: 'FAQ_SECTION',
      content: {
        header: 'Frequently Asked Questions',
        faqItems: [
          { question: 'What services does Compassionate Home Health provide?', answer: 'We offer skilled nursing, physical therapy, occupational therapy, speech therapy, medical social work, and home health aide assistance under physician orders.' },
          { question: 'How do I qualify for home health care?', answer: 'Patients must be confined to the home (homebound) and require skilled intermittent medical care certified by a licensed physician.' },
          { question: 'Is home health care covered by insurance?', answer: 'Yes, home health services are 100% covered by Medicare, Medi-Cal, and most private insurances when eligibility criteria are met.' },
          { question: 'How quickly can home health services begin?', answer: 'Our clinical team typically completes an initial assessment and starts service within 24 to 48 hours of receiving a physician referral.' },
          { question: 'What is the difference between home health and hospice?', answer: 'Home health focuses on recovery, rehabilitation, and managing acute conditions. Hospice provides specialized comfort care and pain management for advanced terminal illnesses.' },
          { question: 'Can patients receive care on weekends or holidays?', answer: 'Yes, registered nurses are on call 24 hours a day, 7 days a week, including weekends and holidays.' }
        ],
        colors: defaultSectionColors
      }
    },

    // Home Health Sections
    {
      id: 'sec-hh-hero',
      layout: 'FULLSCREEN_IMAGE_HEADER',
      content: {
        header: 'Home Health Care Services',
        text: 'Restoring independence and vitality in the comfort of your home with physician-guided clinical excellence.',
        imageUrl: '/assets/images/CareImage1.jpeg',
        buttonText: 'Schedule Consultation',
        buttonLink: '/schedule',
        icon: '🏡',
        colors: {
          backgroundColor: 'surface-white',
          headerColor: 'surface-white',
          textColor: 'surface-light',
          accentColor: 'primary-green'
        }
      }
    },
    {
      id: 'sec-hh-services',
      layout: 'CARD_GRID',
      content: {
        header: 'Comprehensive Home Health Disciplines',
        gridCols: 4,
        cardIds: ['card-hh-doctors', 'card-hh-pt', 'card-hh-ot', 'card-hh-nurses', 'card-hh-st', 'card-hh-chha', 'card-hh-msw', 'card-hh-multilingual'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-hh-advantages',
      layout: 'CARD_GRID',
      content: {
        header: 'The Compassionate Care Advantage',
        gridCols: 4,
        cardIds: ['card-hh-adv-1', 'card-hh-adv-2', 'card-hh-adv-3', 'card-hh-adv-4'],
        colors: altSectionColors
      }
    },
    {
      id: 'sec-hh-specialties',
      layout: 'CARD_GRID',
      content: {
        header: 'Specialized Clinical Rehabilitation',
        gridCols: 3,
        cardIds: ['card-hh-spec-1', 'card-hh-spec-2', 'card-hh-spec-3'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-hh-cta',
      layout: 'HEADER_TEXT',
      content: {
        header: 'Ready to Begin Care?',
        text: 'Our compassionate intake team is standing by to coordinate with your physician and initiate care within 24 to 48 hours.',
        colors: altSectionColors
      }
    },

    // Hospice Sections
    {
      id: 'sec-hospice-hero',
      layout: 'FULLSCREEN_IMAGE_HEADER',
      content: {
        header: 'Hospice & Palliative Care',
        text: 'Providing gentle comfort, dignified support, and comprehensive symptom management so every moment matters.',
        imageUrl: '/assets/images/CareImage1.jpeg',
        buttonText: 'Schedule Consultation',
        buttonLink: '/schedule',
        icon: '❤️',
        colors: {
          backgroundColor: 'surface-white',
          headerColor: 'surface-white',
          textColor: 'surface-light',
          accentColor: 'primary-green'
        }
      }
    },
    {
      id: 'sec-hospice-understanding',
      layout: 'CARD_GRID',
      content: {
        header: 'Understanding Hospice Care',
        gridCols: 3,
        cardIds: ['card-hosp-under-1', 'card-hosp-under-2', 'card-hosp-under-3'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-hospice-benefits',
      layout: 'CARD_GRID',
      content: {
        header: 'Comprehensive Hospice Benefits',
        gridCols: 3,
        cardIds: ['card-hosp-ben-1', 'card-hosp-ben-2', 'card-hosp-ben-3'],
        colors: altSectionColors
      }
    },
    {
      id: 'sec-hospice-comprehensive',
      layout: 'CARD_GRID',
      content: {
        header: 'Our Interdisciplinary Hospice Team',
        gridCols: 3,
        cardIds: ['card-hosp-comp-1', 'card-hosp-comp-2', 'card-hosp-comp-3'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-hospice-above-beyond',
      layout: 'CARD_GRID',
      content: {
        header: 'Going Above & Beyond for Every Family',
        gridCols: 4,
        cardIds: ['card-hosp-ab-1', 'card-hosp-ab-2', 'card-hosp-ab-3', 'card-hosp-ab-4', 'card-hosp-ab-5', 'card-hosp-ab-6', 'card-hosp-ab-7'],
        colors: altSectionColors
      }
    },
    {
      id: 'sec-hospice-process',
      layout: 'CARD_GRID',
      content: {
        header: 'Our 5-Step Hospice Care Process',
        gridCols: 5,
        cardIds: ['card-hosp-step-1', 'card-hosp-step-2', 'card-hosp-step-3', 'card-hosp-step-4', 'card-hosp-step-5'],
        colors: defaultSectionColors
      }
    },
    {
      id: 'sec-hospice-contact',
      layout: 'CONTACT_FORM',
      content: {
        header: 'We Are Here for You 24/7',
        phone: '(925) 954-4441',
        email: 'hospice@compassionate4you.com',
        fax: '(925) 954-4442',
        addressLine1: '1501 N Broadway, Ste 350A/B',
        addressLine2: 'Walnut Creek, CA 94596',
        colors: altSectionColors
      }
    }
  ]

  for (const sec of sections) {
    await prisma.userCreatedSection.upsert({
      where: { id: sec.id },
      create: {
        id: sec.id,
        layout: sec.layout,
        content: sec.content
      },
      update: {
        layout: sec.layout,
        content: sec.content
      }
    })
  }
  console.log(`✓ Seeded ${sections.length} modular sections`)

  // 4. Pages
  const pages = [
    {
      id: 'landing',
      content: {
        title: 'Home',
        sectionIds: [
          'sec-landing-hero',
          'sec-landing-philosophy',
          'sec-landing-caring',
          'sec-landing-info-cards',
          'sec-landing-about',
          'sec-landing-contact',
          'sec-landing-map',
          'sec-landing-faq'
        ]
      }
    },
    {
      id: 'homeHealth',
      content: {
        title: 'Home Health',
        sectionIds: [
          'sec-hh-hero',
          'sec-hh-services',
          'sec-hh-advantages',
          'sec-hh-specialties',
          'sec-hh-cta'
        ]
      }
    },
    {
      id: 'hospice',
      content: {
        title: 'Hospice Care',
        sectionIds: [
          'sec-hospice-hero',
          'sec-hospice-understanding',
          'sec-hospice-benefits',
          'sec-hospice-comprehensive',
          'sec-hospice-above-beyond',
          'sec-hospice-process',
          'sec-hospice-contact'
        ]
      }
    }
  ]

  for (const page of pages) {
    await prisma.userCreatedPage.upsert({
      where: { id: page.id },
      create: {
        id: page.id,
        content: page.content
      },
      update: {
        content: page.content
      }
    })
  }
  console.log(`✓ Seeded ${pages.length} CMS pages (landing, homeHealth, hospice)`)

  console.log('--- CMS Content Seeding Completed Successfully ---')
}

main()
  .catch((err) => {
    console.error('Error during CMS content seeding:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
