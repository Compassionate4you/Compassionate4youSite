// DT-893 Sprint 9
// Gandhar Tare
// Applies a section's saved formatting (content.typography.header / .text)
// to the section's title and description, whichever component draws it.
// The settings are passed as CSS variables; typography-scope.css maps them
// onto the title and description classes the section components use.
//
// When nothing was chosen it renders the children as they are, with no
// extra element, so untouched sections are not changed at all.

import { typographyScopeProps } from './typographyStyle'
import '../../styles/components/modular/typography-scope.css'

export default function TypographyScope ({ typography, children }) {
  const props = typographyScopeProps(typography)
  if (!props) return children
  return (
    <div className='c4-typography-scope' style={props.style} {...props.data}>
      {children}
    </div>
  )
}
