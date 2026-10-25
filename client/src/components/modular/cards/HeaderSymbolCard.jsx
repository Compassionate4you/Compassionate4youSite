// DT-622 Sprint 8
// Preston Ball
// Modular header symbol card component supporting icon badges and alignment

import React from 'react'
import {
  Heart,
  Check,
  Home,
  Stethoscope,
  Users,
  Phone,
  Pill,
  Activity,
  Star,
  Shield,
  ShieldCheck,
  Award,
  Smile
} from 'lucide-react'
import '../../../styles/components/modular/cards/HeaderSymbolCard.css'

const ICONS = {
  heart: Heart,
  check: Check,
  home: Home,
  stethoscope: Stethoscope,
  users: Users,
  phone: Phone,
  pill: Pill,
  activity: Activity,
  star: Star,
  shield: Shield,
  shieldcheck: ShieldCheck,
  award: Award,
  smile: Smile
}

export const SYMBOL_NAMES = Object.keys(ICONS)

export default function HeaderSymbolCard ({
  header,
  symbol,
  alignment = 'center',
  style = {}
}) {
  const Icon = typeof symbol === 'string' ? ICONS[symbol.toLowerCase()] : null
  const alignClass = `card--align-${alignment || 'center'}`

  return (
    <article className={`card--symbol ${alignClass}`} style={style}>
      <div className="card__symbol" aria-hidden="true">
        {Icon ? <Icon size={32} /> : <span>{symbol || '✦'}</span>}
      </div>
      {header && <h3>{header}</h3>}
    </article>
  )
}
