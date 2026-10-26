import {
  Activity, ClipboardCheck, Coins, FileCheck, Heart, HeartHandshake,
  House, ShieldCheck, Stethoscope, TrendingUp, Users
} from 'lucide-react'

// Explicit imports keep the available icons predictable for future editor inputs.
const SECTION_ICONS = {
  Activity,
  ClipboardCheck,
  Coins,
  FileCheck,
  Heart,
  HeartHandshake,
  House,
  Home: House,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users
}

export default function SectionIcon ({ name }) {
  const Icon = Object.hasOwn(SECTION_ICONS, name) ? SECTION_ICONS[name] : Heart
  return <Icon aria-hidden='true' focusable='false' strokeWidth={1.6} />
}
