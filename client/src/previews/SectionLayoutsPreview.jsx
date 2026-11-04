import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Heart, HeartHandshake, Users } from 'lucide-react'
import { HeaderCardsSection, HeaderStackSection, TimelineSection } from '../components/modular/sections'
import english from '../locales/en/translation.json'
import careImage from '../assets/images/CareImage1.jpeg'
import '../styles/global.css'
// Include existing styles to expose accidental interactions in this isolated preview.
import '../styles/card-sections.css'
import '../styles/HospicePage.css'
import '../styles/responsive.css'
import '../styles/section-layouts.css'
import './section-layouts-preview.css'

// DT-861: Welcome examples share the site copy with distinct decorative icons.
const welcomeSections = [
  { id: 'about', title: english.landing.aboutTitle, description: english.landing.aboutText, Icon: Users },
  { id: 'caring', title: english.landing.caringSinceTitle, description: english.landing.caringSinceText, Icon: HeartHandshake },
  { id: 'philosophy', title: english.landing.philosophyTitle, description: english.landing.philosophyText, Icon: Heart }
]

const advantages = [
  { id: 'obligations', description: 'We manage all employer obligations in payroll, taxes and compensation.', iconName: 'FileCheck' },
  { id: 'cost', description: 'More cost efficient than hospitalization.', iconName: 'Coins' },
  { id: 'recovery', description: 'Faster rate of client recovery.', iconName: 'TrendingUp' },
  { id: 'participation', description: 'Clients have the right to participate in their plan of care.', iconName: 'Users' },
  { id: 'home', description: 'Services are rendered in the client’s place of residence.', iconName: 'House' },
  { id: 'safety', description: 'Avoidance of hospital acquired infections.', iconName: 'ShieldCheck' }
]

const questions = [
  { id: 'what', title: 'What is Hospice?', description: 'Hospice care focuses on providing comfort, quality of life, and support for people nearing the end of life. A team of professionals helps manage symptoms and supports the patient and family with compassion.' },
  { id: 'eligible', title: 'Who is eligible?', description: 'Our team can help patients and families understand their care options and eligibility.' },
  { id: 'different', title: 'How is hospice different?', description: 'Care focuses on comfort and support, with a plan tailored to each person’s needs.' },
  { id: 'choose', title: 'Why might I choose hospice?', description: 'Patients and families receive ongoing guidance and support during an important time.' },
  { id: 'team', title: 'Who provides the care?', description: 'A coordinated team works together with the patient, family, and caregivers.' }
]

const steps = [
  { id: 'referral', title: 'Referral', description: 'Doctor, hospital, or family starts the process.' },
  { id: 'assessment', title: 'Assessment', description: 'Nurse or therapist evaluates health, abilities, and family goals.' },
  { id: 'plan', title: 'Care Plan', description: 'Customized plan including nursing, therapy, and supporting services.' },
  { id: 'support', title: 'Ongoing Support', description: 'Regular visits, telehealth check-ins, and caregiver guidance.' },
  { id: 'communication', title: 'Communication', description: 'Open dialogue between patient, family, and care team.' },
  { id: 'review', title: 'Review', description: 'The care team reviews the plan as needs change.' }
]

// DT-861: Display the Welcome banner examples alongside the existing DT-743 layouts.
function SectionLayoutsPreview () {
  const [headerPosition, setHeaderPosition] = useState('left')
  const [background, setBackground] = useState(true)
  const [columns, setColumns] = useState(1)
  const [stepCount, setStepCount] = useState(5)
  const [dark, setDark] = useState(false)

  return (
    <main className='c4-preview' theme={dark ? 'dark' : 'light'}>
      <div className='c4-preview__controls'>
        <h1>Section layout preview · DT-743 / DT-861</h1>
        <label>Header position
          <select value={headerPosition} onChange={event => setHeaderPosition(event.target.value)}>
            <option value='left'>Left</option><option value='right'>Right</option>
          </select>
        </label>
        <label><input type='checkbox' checked={background} onChange={event => setBackground(event.target.checked)} /> Background image</label>
        <label>Stack columns
          <select value={columns} onChange={event => setColumns(Number(event.target.value))}>
            <option value={1}>One</option><option value={2}>Two</option>
          </select>
        </label>
        <label>Timeline steps
          <select value={stepCount} onChange={event => setStepCount(Number(event.target.value))}>
            {[0, 1, 5, 6].map(count => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
        <label><input type='checkbox' checked={dark} onChange={event => setDark(event.target.checked)} /> Dark theme</label>
      </div>
      {/* DT-861: Centered Welcome panels matching the icon-and-divider reference. */}
      <div className='c4-welcome-banners'>
        {welcomeSections.map(({ id, title, description, Icon }) => (
          <section className='c4-welcome-banner' aria-labelledby={`welcome-${id}-title`} key={id}>
            <div className='c4-welcome-banner__ornament' aria-hidden='true'>
              <span className='c4-welcome-banner__badge'>
                <Icon focusable='false' strokeWidth={1.6} />
              </span>
            </div>
            <h2 className='c4-welcome-banner__title' id={`welcome-${id}-title`}>{title}</h2>
            <p className='c4-welcome-banner__description'>{description}</p>
          </section>
        ))}
      </div>
      <HeaderCardsSection
        label='Better care at home'
        title='Home Health Advantages'
        subtitle='Compassionate care that improves lives—at home and in the community.'
        items={advantages}
        headerPosition={headerPosition}
        backgroundImageUrl={background ? careImage : undefined}
      />
      <HeaderStackSection
        label='Our care'
        title='Understanding Hospice Care'
        subtitle='Find answers to common questions about hospice care and how our team supports patients and families during this important time.'
        items={questions}
        columns={columns}
      />
      <TimelineSection title='Our Care Process' items={steps.slice(0, stepCount)} />
      <aside className='c4-preview__legacy'>
        <h2>Existing card style check</h2>
        <div className='portals-section'>
          <div className='card'><h3>Existing portal card</h3><p>Existing styles should remain unchanged.</p></div>
        </div>
      </aside>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<SectionLayoutsPreview />)
