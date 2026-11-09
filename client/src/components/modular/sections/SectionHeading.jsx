import { useId } from 'react'

export default function SectionHeading ({ id, title, subtitle, label }) {
  return (
    <header className='c4-section__heading'>
      {label && <p className='c4-section__label'>{label}</p>}
      {title && <h2 id={id} className='c4-section__title'>{title}</h2>}
      {subtitle && <p className='c4-section__subtitle'>{subtitle}</p>}
    </header>
  )
}

export function useSectionTitleId (title) {
  const id = useId()
  return title ? id : undefined
}
