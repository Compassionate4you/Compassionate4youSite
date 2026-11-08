// DT-625 Sprint 8
// Preston Ball
// Reusable typography formatting control bar supporting text alignment, font family, bold, and italics

import React from 'react'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Italic } from 'lucide-react'
import CustomSelect from './CustomSelect'
import { isUntouchedDefault } from '../../modular/typographyStyle'

// DT-893 Sprint 9 - Gandhar Tare: weight is Default / Bold / Regular, so a
// heading that is bold by design can be made regular.
const WEIGHT_OPTIONS = [
  { value: 'default', label: 'Weight: Default' },
  { value: 'bold', label: 'Bold' },
  { value: 'normal', label: 'Regular (not bold)' }
]

const FONT_OPTIONS = [
  { value: 'inherit', label: 'Default / System Font' },
  { value: 'Inter, system-ui, sans-serif', label: 'Sans-serif (Modern)' },
  { value: 'Georgia, Cambria, serif', label: 'Serif (Editorial)' },
  { value: 'ui-monospace, monospace', label: 'Monospace (Clean)' }
]

export default function TypographyControls ({
  label = 'Typography & Formatting',
  value = {},
  onChange,
  disabled = false
}) {
  // DT-893 Sprint 9 - Gandhar Tare: nothing chosen means "keep the page's own
  // style". The editor used to show Left as chosen and save it, which forced
  // centered text to the left; that untouched default now reads as Default.
  const source = isUntouchedDefault(value) ? {} : (value || {})
  const current = {
    align: source.align || 'default',
    fontFamily: source.fontFamily || 'inherit',
    weight: source.bold === true ? 'bold' : (source.weight === 'normal' ? 'normal' : 'default'),
    italic: Boolean(source.italic)
  }

  // Saves only what was chosen. bold stays a boolean so older renderers keep
  // reading it; weight 'normal' means "force not bold".
  const update = (patch) => {
    if (disabled) return
    const next = { ...current, ...patch }
    const saved = {
      fontFamily: next.fontFamily,
      bold: next.weight === 'bold',
      italic: next.italic
    }
    if (next.align !== 'default') saved.align = next.align
    if (next.weight === 'normal') saved.weight = 'normal'
    onChange(saved)
  }

  return (
    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      {label && (
        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* DT-625 Sprint 8 - Preston Ball: Text alignment toggle group */}
        <div style={{ display: 'inline-flex', borderRadius: 6, border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
          {[
            // DT-893 Sprint 9 - Gandhar Tare: keep the page's own alignment
            { id: 'default', icon: <span style={{ fontSize: 12, fontWeight: 600 }}>Default</span>, title: 'Default alignment' },
            { id: 'left', icon: <AlignLeft size={15} />, title: 'Align Left' },
            { id: 'center', icon: <AlignCenter size={15} />, title: 'Align Center' },
            { id: 'right', icon: <AlignRight size={15} />, title: 'Align Right' },
            { id: 'justify', icon: <AlignJustify size={15} />, title: 'Justify' }
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              title={btn.title}
              aria-label={btn.title}
              aria-pressed={current.align === btn.id}
              disabled={disabled}
              onClick={() => update({ align: btn.id })}
              style={{
                padding: '6px 8px',
                border: 'none',
                background: current.align === btn.id ? '#0f172a' : 'transparent',
                color: current.align === btn.id ? '#ffffff' : '#475569',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* DT-625 Sprint 8 - Preston Ball: Bold and Italic toggles */}
        {/* DT-893 Sprint 9 - Gandhar Tare: Bold is now the Weight choice below */}
        <div style={{ minWidth: 150 }}>
          <CustomSelect
            value={current.weight}
            onChange={(val) => update({ weight: val })}
            options={WEIGHT_OPTIONS}
            disabled={disabled}
            ariaLabel="Font weight selector"
          />
        </div>
        <div style={{ display: 'inline-flex', borderRadius: 6, border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
          <button
            type="button"
            title="Italic"
            aria-label="Italic"
            aria-pressed={current.italic}
            disabled={disabled}
            onClick={() => update({ italic: !current.italic })}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: current.italic ? '#0f172a' : 'transparent',
              color: current.italic ? '#ffffff' : '#475569',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Italic size={15} />
          </button>
        </div>

        {/* DT-625 Sprint 8 - Preston Ball: Font Family Select */}
        <div style={{ minWidth: 170, flex: 1 }}>
          <CustomSelect
            value={current.fontFamily}
            onChange={(val) => update({ fontFamily: val })}
            options={FONT_OPTIONS}
            disabled={disabled}
            ariaLabel="Font family selector"
          />
        </div>
      </div>
    </div>
  )
}
