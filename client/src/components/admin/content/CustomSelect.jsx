// DT-625 Sprint 8
// Preston Ball
// Accessible custom dropdown select component replacing unstyled browser select elements

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import '../../../styles/components/CustomSelect.css'

export default function CustomSelect ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  style = {},
  className = '',
  ariaLabel
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label || opt.name || opt.title || opt.id || String(opt.value),
        color: opt.color || opt.lightModeColor,
        subtitle: opt.subtitle
      }
    }
    return { value: opt, label: String(opt) }
  })

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))

  // DT-625 Sprint 8 - Preston Ball: Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside (e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // DT-625 Sprint 8 - Preston Ball: Handle option selection
  const handleSelect = (val) => {
    if (disabled) return
    onChange(val)
    setIsOpen(false)
  }

  // DT-625 Sprint 8 - Preston Ball: Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value))
      const nextIndex = currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0
      if (normalizedOptions[nextIndex]) {
        onChange(normalizedOptions[nextIndex].value)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      const currentIndex = normalizedOptions.findIndex((opt) => String(opt.value) === String(value))
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1
      if (normalizedOptions[prevIndex]) {
        onChange(normalizedOptions[prevIndex].value)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={style}
    >
      {/* DT-625 Sprint 8 - Preston Ball: Dropdown trigger button */}
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <span className="custom-select-value">
          {selectedOption?.color && (
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: selectedOption.color,
                border: '1px solid #cbd5e1'
              }}
            />
          )}
          {selectedOption ? (
            <span>
              {selectedOption.label}
              {selectedOption.subtitle && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 6 }}>
                  ({selectedOption.subtitle})
                </span>
              )}
            </span>
          ) : (
            <span className="custom-select-placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
            color: '#64748b'
          }}
          aria-hidden="true"
        />
      </button>

      {/* DT-625 Sprint 8 - Preston Ball: Dropdown options list */}
      {isOpen && (
        <ul className="custom-select-dropdown" role="listbox">
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value)
            return (
              <li
                key={opt.value}
                className={`custom-select-option ${isSelected ? 'custom-select-option--selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {opt.color && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: opt.color,
                        border: '1px solid #cbd5e1'
                      }}
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={16} color="#0369a1" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
