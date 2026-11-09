// DT-903 DT-920 DT-922 Sprint 9
// PBall
// Reusable color editing component and direct element color resolution utilities for Section and Card style selectors

import React from 'react'
import { ColorConfigService } from '../../../services/colorConfigService'

// DT-922 Sprint 9 - PBall: Default direct color pairs stored on sections and cards
export const DEFAULT_SECTION_COLORS = {
  backgroundColor: { light: '#ffffff', dark: '#0f172a' },
  headerColor: { light: '#0f172a', dark: '#f8fafc' },
  textColor: { light: '#334155', dark: '#cbd5e1' },
  accentColor: { light: '#366454', dark: '#4ade80' }
}

export const DEFAULT_CARD_COLORS = {
  backgroundColor: { light: '#ffffff', dark: '#1e293b' },
  headerColor: { light: '#0f172a', dark: '#f8fafc' },
  textColor: { light: '#334155', dark: '#cbd5e1' }
}

// DT-922 Sprint 9 - PBall: Preset dual-mode color swatches for quick style selection
export const COLOR_PRESETS = [
  { label: 'Surface White', light: '#ffffff', dark: '#1e293b' },
  { label: 'Surface Light', light: '#f8fafc', dark: '#0f172a' },
  { label: 'Light Green', light: '#DBE4C3', dark: '#2d3748' },
  { label: 'Sage', light: '#9DA191', dark: '#1e293b' },
  { label: 'Primary Green', light: '#366454', dark: '#4ade80' },
  { label: 'Brand Dark', light: '#0f172a', dark: '#f8fafc' },
  { label: 'Charcoal', light: '#262626', dark: '#ffffff' },
  { label: 'Slate', light: '#475569', dark: '#cbd5e1' },
  { label: 'Navy', light: '#0f3460', dark: '#60a5fa' }
]

// DT-922 Sprint 9 - PBall: Legacy token map for backward compatibility with older cached elements
const LEGACY_TOKEN_MAP = {
  'primary-green': { light: '#366454', dark: '#4ade80' },
  'brand-dark': { light: '#0f172a', dark: '#f8fafc' },
  'surface-white': { light: '#ffffff', dark: '#1e293b' },
  'surface-light': { light: '#f8fafc', dark: '#0f172a' },
  'text-main': { light: '#1e293b', dark: '#f8fafc' },
  'text-muted': { light: '#64748b', dark: '#94a3b8' },
  'accent-gold': { light: '#d97706', dark: '#fbbf24' },
  'divider-gray': { light: '#e2e8f0', dark: '#334155' },
  'color-charcoal': { light: '#262626', dark: '#ffffff' },
  'color-sage': { light: '#9DA191', dark: '#1e293b' },
  'color-light-green': { light: '#DBE4C3', dark: '#2d3748' },
  'color-navy': { light: '#0f3460', dark: '#60a5fa' },
  'color-slate': { light: '#595959', dark: '#f1f5f9' }
}

// DT-922 Sprint 9 - PBall: Normalize any stored color representation into a { light, dark } pair
export function normalizeColorPair (colorValue, defaultPair = { light: '#ffffff', dark: '#0f172a' }) {
  if (!colorValue) {
    return { ...defaultPair }
  }

  if (typeof colorValue === 'object') {
    const light = colorValue.light || colorValue.lightModeColor || defaultPair.light
    const dark = colorValue.dark || colorValue.darkModeColor || defaultPair.dark
    return { light, dark }
  }

  if (typeof colorValue === 'string') {
    const trimmed = colorValue.trim()
    if (!trimmed) return { ...defaultPair }
    if (LEGACY_TOKEN_MAP[trimmed]) {
      return { ...LEGACY_TOKEN_MAP[trimmed] }
    }
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')) {
      return { light: trimmed, dark: trimmed }
    }
  }

  return { ...defaultPair }
}

// DT-922 Sprint 9 - PBall: Resolve an element's stored color value directly for the active theme
export function resolveElementColor (colorValue, theme = 'light', fallback = '#ffffff') {
  if (!colorValue) return fallback

  if (typeof colorValue === 'object') {
    const light = colorValue.light || colorValue.lightModeColor || ''
    const dark = colorValue.dark || colorValue.darkModeColor || ''
    const chosen = theme === 'dark' ? (dark || light) : (light || dark)
    return chosen || fallback
  }

  if (typeof colorValue === 'string') {
    const trimmed = colorValue.trim()
    if (!trimmed) return fallback
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl') || trimmed.startsWith('var(')) {
      return trimmed
    }
    const fromService = ColorConfigService?.getColorById?.(trimmed)
    if (fromService) {
      return theme === 'dark' ? fromService.darkModeColor : fromService.lightModeColor
    }
    if (LEGACY_TOKEN_MAP[trimmed]) {
      return theme === 'dark' ? LEGACY_TOKEN_MAP[trimmed].dark : LEGACY_TOKEN_MAP[trimmed].light
    }
  }

  return fallback
}

// DT-920 Sprint 9 - PBall: Ensure a valid 6-digit hex value for native <input type="color">
function toSafeHex (val, fallback = '#ffffff') {
  if (!val || typeof val !== 'string') return fallback
  const trimmed = val.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1]
    const g = trimmed[2]
    const b = trimmed[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return fallback
}

// DT-920 Sprint 9 - PBall: Individual dual-mode (Light/Dark) color picker field
export function ColorPickerField ({
  label,
  value,
  defaultPair = { light: '#ffffff', dark: '#0f172a' },
  onChange
}) {
  const pair = normalizeColorPair(value, defaultPair)

  const handleLightChange = (newLight) => {
    onChange({ ...pair, light: newLight })
  }

  const handleDarkChange = (newDark) => {
    onChange({ ...pair, dark: newDark })
  }

  const handlePresetSelect = (preset) => {
    onChange({ light: preset.light, dark: preset.dark })
  }

  const handleReset = () => {
    onChange({ ...defaultPair })
  }

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{label}</span>
        <button
          type="button"
          onClick={handleReset}
          style={{
            fontSize: '11px',
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Reset Default
        </button>
      </div>

      {/* DT-920 Sprint 9 - PBall: Light and Dark color wheel and hex inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
            ☀️ Light Mode
          </label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="color"
              aria-label={`${label} Light Mode Color Wheel`}
              value={toSafeHex(pair.light, defaultPair.light)}
              onChange={(e) => handleLightChange(e.target.value)}
              style={{
                width: '36px',
                height: '36px',
                padding: '2px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#ffffff',
                flexShrink: 0
              }}
            />
            <input
              type="text"
              aria-label={`${label} Light Mode Hex`}
              value={pair.light}
              onChange={(e) => handleLightChange(e.target.value)}
              placeholder={defaultPair.light}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
            🌙 Dark Mode
          </label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="color"
              aria-label={`${label} Dark Mode Color Wheel`}
              value={toSafeHex(pair.dark, defaultPair.dark)}
              onChange={(e) => handleDarkChange(e.target.value)}
              style={{
                width: '36px',
                height: '36px',
                padding: '2px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#ffffff',
                flexShrink: 0
              }}
            />
            <input
              type="text"
              aria-label={`${label} Dark Mode Hex`}
              value={pair.dark}
              onChange={(e) => handleDarkChange(e.target.value)}
              placeholder={defaultPair.dark}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>
      </div>

      {/* DT-920 Sprint 9 - PBall: Quick preset swatches */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>Presets:</span>
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            title={`${preset.label} (Light: ${preset.light} / Dark: ${preset.dark})`}
            onClick={() => handlePresetSelect(preset)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              borderRadius: '4px',
              border: (pair.light.toLowerCase() === preset.light.toLowerCase() && pair.dark.toLowerCase() === preset.dark.toLowerCase())
                ? '2px solid #0f172a'
                : '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: preset.light, border: '1px solid #94a3b8' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: preset.dark, border: '1px solid #94a3b8' }} />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// DT-920 Sprint 9 - PBall: Style selector color editor grouping element color fields
export default function ColorEditor ({ fields = [] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '14px',
      background: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1'
    }}>
      {fields.map((field) => (
        <ColorPickerField
          key={field.key || field.label}
          label={field.label}
          value={field.value}
          defaultPair={field.defaultPair}
          onChange={field.onChange}
        />
      ))}
    </div>
  )
}
