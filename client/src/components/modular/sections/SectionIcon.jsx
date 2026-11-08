import {
  Accessibility, Apple, Bandage, Bone, BriefcaseMedical, CalendarDays, Church, ClipboardList, Clock, Cross, Droplets, FlaskConical, GraduationCap, HandHelping, HeartPulse, Languages, Phone, Pill, Speech, TestTube, Wind,
  Activity, ClipboardCheck, Coins, FileCheck, Heart, HeartHandshake,
  House, ShieldCheck, Stethoscope, TrendingUp, Users
} from 'lucide-react'

// DT-902: Register service-specific decorative icons alongside existing editor selections.
// Explicit imports keep the available icons predictable for future editor inputs.
const SECTION_ICONS = {
  Accessibility,
  Apple,
  Bandage,
  Bone,
  BriefcaseMedical,
  CalendarDays,
  Church,
  ClipboardList,
  Clock,
  Cross,
  Droplets,
  FlaskConical,
  GraduationCap,
  HandHelping,
  HeartPulse,
  Languages,
  Phone,
  Pill,
  Speech,
  TestTube,
  Wind,
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

// DT-902: Preserve decorative accessibility and the unknown-name fallback for all icons.
export default function SectionIcon ({ name }) {
  const Icon = Object.hasOwn(SECTION_ICONS, name) ? SECTION_ICONS[name] : Heart
  return <Icon aria-hidden='true' focusable='false' strokeWidth={1.6} />
}
