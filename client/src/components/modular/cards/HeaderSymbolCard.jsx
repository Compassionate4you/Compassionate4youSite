// DT-875 DT-622 Sprint 9
// PBall
// Modular header symbol card component supporting expanded Lucide icon set, optional description, and alignment

import React from 'react'
import {
  Accessibility,
  Activity,
  Apple,
  Award,
  Bandage,
  Bone,
  BriefcaseMedical,
  CalendarDays,
  Check,
  Church,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Coins,
  Cross,
  Droplets,
  FileCheck,
  FlaskConical,
  GraduationCap,
  HandHelping,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  House,
  Languages,
  Phone,
  Pill,
  Shield,
  ShieldCheck,
  Smile,
  Speech,
  Star,
  Stethoscope,
  TestTube,
  TrendingUp,
  Users,
  Wind
} from 'lucide-react'
import CardBody from './CardBase'
import '../../../styles/components/modular/cards/HeaderSymbolCard.css'

const ICONS = {
  accessibility: Accessibility,
  activity: Activity,
  apple: Apple,
  award: Award,
  bandage: Bandage,
  bone: Bone,
  briefcasemedical: BriefcaseMedical,
  calendardays: CalendarDays,
  check: Check,
  church: Church,
  clipboardcheck: ClipboardCheck,
  clipboardlist: ClipboardList,
  clock: Clock,
  coins: Coins,
  cross: Cross,
  droplets: Droplets,
  filecheck: FileCheck,
  flaskconical: FlaskConical,
  graduationcap: GraduationCap,
  handhelping: HandHelping,
  heart: Heart,
  hearthandshake: HeartHandshake,
  heartpulse: HeartPulse,
  home: Home,
  house: House,
  languages: Languages,
  phone: Phone,
  pill: Pill,
  shield: Shield,
  shieldcheck: ShieldCheck,
  smile: Smile,
  speech: Speech,
  star: Star,
  stethoscope: Stethoscope,
  testtube: TestTube,
  trendingup: TrendingUp,
  users: Users,
  wind: Wind
}

export const SYMBOL_NAMES = Object.keys(ICONS)

export default function HeaderSymbolCard ({
  header,
  paragraph,
  symbol,
  alignment = 'center',
  typography = {},
  style = {}
}) {
  const Icon = typeof symbol === 'string' ? ICONS[symbol.toLowerCase()] : null
  const alignClass = `card--align-${alignment || 'center'}`
  const headerTypo = typography.header || {}
  const textTypo = typography.paragraph || typography.text || {}
  const headerStyle = {
    textAlign: headerTypo.align || undefined,
    fontFamily: headerTypo.fontFamily && headerTypo.fontFamily !== 'inherit' ? headerTypo.fontFamily : undefined,
    fontWeight: headerTypo.bold ? 'bold' : undefined,
    fontStyle: headerTypo.italic ? 'italic' : undefined
  }
  const textStyle = {
    textAlign: textTypo.align || undefined,
    fontFamily: textTypo.fontFamily && textTypo.fontFamily !== 'inherit' ? textTypo.fontFamily : undefined,
    fontWeight: textTypo.bold ? 'bold' : undefined,
    fontStyle: textTypo.italic ? 'italic' : undefined
  }

  return (
    <article className={`card--symbol ${alignClass}`} style={style}>
      <div className="card__symbol" aria-hidden="true">
        {Icon ? <Icon size={32} /> : <span>{symbol || '✦'}</span>}
      </div>
      {header && <h3 style={headerStyle}>{header}</h3>}
      {paragraph && (
        <div style={textStyle}>
          <CardBody text={paragraph} />
        </div>
      )}
    </article>
  )
}
