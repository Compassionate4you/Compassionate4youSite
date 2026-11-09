// DT-625 Sprint 8
// Preston Ball
// Reusable typography formatting control bar supporting text alignment, font family, bold, and italics

import React from 'react'
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic } from 'lucide-react'
import CustomSelect from './CustomSelect'

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
  const current = {
    align: value?.align || 'left',
    fontFamily: value?.fontFamily || 'inherit',
    bold: Boolean(value?.bold),
    italic: Boolean(value?.italic)
  }

  const update = (patch) => {
    if (disabled) return
    onChange({ ...current, ...patch })
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
            { id: 'left', icon: <AlignLeft size={15} />, title: 'Align Left' },
            { id: 'center', icon: <AlignCenter size={15} />, title: 'Align Center' },
            { id: 'right', icon: <AlignRight size={15} />, title: 'Align Right' },
            { id: 'justify', icon: <AlignJustify size={15} />, title: 'Justify' }
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              title={btn.title}
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
        <div style={{ display: 'inline-flex', borderRadius: 6, border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
          <button
            type="button"
            title="Bold"
            disabled={disabled}
            onClick={() => update({ bold: !current.bold })}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: current.bold ? '#0f172a' : 'transparent',
              color: current.bold ? '#ffffff' : '#475569',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            title="Italic"
            disabled={disabled}
            onClick={() => update({ italic: !current.italic })}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderLeft: '1px solid #e2e8f0',
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
