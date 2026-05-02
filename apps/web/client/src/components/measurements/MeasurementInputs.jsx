import React, { useState } from 'react'
import { MEASUREMENT_FIELDS } from '@listnrent/shared/measurements'

/**
 * Single measurement input field with tooltip and validation
 */
export const MeasurementInput = ({
  fieldKey,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const field = MEASUREMENT_FIELDS[fieldKey]

  if (!field) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-semibold text-[#1A1A1A]">
          {field.label}
          {required && <span className="text-[#C8622A] ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="ml-auto text-[11px] font-medium text-[#888] hover:text-[#1A1A1A] transition-colors p-1 rounded hover:bg-[#F0EAE0]"
          title={field.tooltip}
        >
          ℹ️
        </button>
      </div>

      {showTooltip && (
        <div className="mb-3 p-3 rounded-lg bg-[#FBF9F5] border border-[#E8E0D5] text-xs text-[#666] leading-relaxed">
          {field.tooltip}
        </div>
      )}

      <div className="relative">
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value || ''}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none transition-all placeholder:text-[#CCC] text-[#1A1A1A] ${
            error
              ? 'border-[#C8622A] focus:border-[#C8622A] bg-[rgba(200,98,42,0.04)]'
              : 'border-[#E8E0D5] focus:border-[#D4AF37]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#999]">
          cm
        </span>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#C8622A]">{error}</p>
      )}

      {!error && (
        <p className="mt-1.5 text-xs text-[#999]">
          {field.min}–{field.max} cm
        </p>
      )}
    </div>
  )
}

/**
 * Measurement group component
 * Renders multiple measurement inputs with section heading
 */
export const MeasurementGroup = ({
  title,
  fields,
  measurements,
  errors,
  onChange,
  disabled = false,
}) => {
  if (!fields || fields.length === 0) return null

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-[#E8E0D5] bg-white">
      <h4 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.08em]">
        {title}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => (
          <MeasurementInput
            key={field.key}
            fieldKey={field.key}
            value={measurements[field.key]}
            onChange={onChange}
            error={errors?.[field.key]}
            required={field.required}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Size preview badge showing live calculated size
 */
export const SizePreview = ({ size, confidence, isBetween, note }) => {
  if (!size) return null

  const confidenceColor =
    confidence > 0.2 ? 'bg-[#00342B] text-white' : 'bg-[#FFF9E6] text-[#996B00]'

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#D4AF37] bg-[rgba(212,175,55,0.08)]">
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">
          Calculated Size
        </p>
        <p className="text-2xl font-black text-[#1A1A1A] mt-1">{size}</p>
        {note && <p className="text-xs text-[#666] mt-1">{note}</p>}
      </div>

      <div
        className={`px-3 py-1.5 rounded-full text-xs font-bold ${confidenceColor}`}
      >
        {confidence > 0.2 ? '✓ Accurate' : '~ Estimate'}
      </div>
    </div>
  )
}

/**
 * Measurement help card with size reference
 */
export const MeasurementHelp = ({ category }) => {
  return (
    <div className="p-5 rounded-2xl border border-[#E8D5C4] bg-[linear-gradient(135deg,#FBF9F5_0%,#F5F1E8_100%)]">
      <h5 className="text-sm font-bold text-[#1A1A1A] mb-3">📏 Measurement Tips</h5>

      <ul className="space-y-2.5 text-xs text-[#666]">
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            Use a flexible measuring tape or string for accuracy
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            Measure the actual outfit, not a person wearing it
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            Keep tape flat but not tight
          </span>
        </li>
        <li className="flex gap-2">
          <span className="shrink-0">•</span>
          <span>
            Centimeters for consistency
          </span>
        </li>
      </ul>

      <div className="mt-4 pt-4 border-t border-[#E8D5C4]">
        <p className="text-xs font-semibold text-[#996B00] mb-2">
          Size Reference
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#666]">
          <div>
            <span className="font-bold text-[#1A1A1A]">S:</span> Chest 81–91 cm
          </div>
          <div>
            <span className="font-bold text-[#1A1A1A]">M:</span> Chest 91–102 cm
          </div>
          <div>
            <span className="font-bold text-[#1A1A1A]">L:</span> Chest 102–112 cm
          </div>
          <div>
            <span className="font-bold text-[#1A1A1A]">XL:</span> Chest 112+ cm
          </div>
        </div>
      </div>
    </div>
  )
}
