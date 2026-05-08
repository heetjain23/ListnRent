import React from 'react'
import { motion } from 'motion/react'
import { getMeasurementFieldsForCategory } from '@listnrent/shared/measurements'

// ─── Category Badge ────────────────────────────────────────────────────────────
const CategoryBadge = ({ category = 'Category' }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.18em] uppercase"
    style={{
      backgroundColor: 'rgba(212,175,55,0.1)',
      color: '#8B7340',
      border: '1px solid rgba(212,175,55,0.4)',
    }}
  >
    <span style={{ color: '#D4AF37', fontSize: '8px' }}>◆</span>
    {category}
  </motion.span>
)

// ─── Availability Badge ────────────────────────────────────────────────────────
const AvailabilityBadge = ({ isActive }) => (
  <motion.div
    initial={{ opacity: 0, x: 8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.15 }}
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
    style={{
      backgroundColor: isActive ? 'rgba(0,77,64,0.1)' : 'rgba(200,98,42,0.1)',
      color: isActive ? '#004D40' : '#C8622A',
      border: `1px solid ${isActive ? 'rgba(0,77,64,0.25)' : 'rgba(200,98,42,0.25)'}`,
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: isActive ? '#004D40' : '#C8622A' }}
    />
    {isActive ? 'Available' : 'Unavailable'}
  </motion.div>
)

const toPlainObject = (value) => {
  if (!value) return {}
  if (value instanceof Map) return Object.fromEntries(value)
  return value
}

const getMeasurementValue = (measurementBuckets, key) => {
  const { measurements, baseMeasurements, extraMeasurements } = measurementBuckets
  if (baseMeasurements[key] !== undefined && baseMeasurements[key] !== null && baseMeasurements[key] !== '') {
    return baseMeasurements[key]
  }
  if (extraMeasurements[key] !== undefined && extraMeasurements[key] !== null && extraMeasurements[key] !== '') {
    return extraMeasurements[key]
  }
  if (measurements[key] !== undefined && measurements[key] !== null && measurements[key] !== '') {
    return measurements[key]
  }
  return null
}

const formatMeasurementValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  return `${value} cm`
}

const groupFieldsBySection = (fields) => {
  const upperBody = fields.filter((field) => field.family?.includes('upper-body'))
  const lowerBody = fields.filter((field) => field.family?.includes('lower-body'))
  const otherFields = fields.filter(
    (field) => !field.family?.includes('upper-body') && !field.family?.includes('lower-body'),
  )

  return [
    { key: 'upper-body', label: 'Upper Body', fields: upperBody },
    { key: 'lower-body', label: 'Lower Body', fields: lowerBody },
    { key: 'additional', label: 'Additional', fields: otherFields },
  ].filter((section) => section.fields.length > 0)
}

const MeasurementsSection = ({ listing }) => {
  const measurements = listing.measurements || {}
  const allMeasurements = toPlainObject(measurements.allMeasurements)
  const baseMeasurements = toPlainObject(measurements.base)
  const extraMeasurements = toPlainObject(measurements.extra)
  const { baseFields, extraFields } = getMeasurementFieldsForCategory(listing.category, listing.gender)
  const fitNotes = measurements.fitNotes || listing.measurementNotes || listing.fitNotes
  const groupedBaseFields = groupFieldsBySection(baseFields)
  const groupedExtraFields = groupFieldsBySection(extraFields)
  const measurementBuckets = {
    measurements: Object.keys(allMeasurements).length > 0 ? allMeasurements : toPlainObject(measurements),
    baseMeasurements: Object.keys(baseMeasurements).length > 0 ? baseMeasurements : toPlainObject(measurements.base),
    extraMeasurements: Object.keys(extraMeasurements).length > 0 ? extraMeasurements : toPlainObject(measurements.extra),
  }

  const rows = [
    ...baseFields
      .map((field) => ({ key: field.key, label: field.label, value: getMeasurementValue(measurementBuckets, field.key) }))
      .filter((row) => row.value !== undefined && row.value !== null && row.value !== ''),
    ...extraFields
      .map((field) => ({ key: field.key, label: field.label, value: getMeasurementValue(measurementBuckets, field.key) }))
      .filter((row) => row.value !== undefined && row.value !== null && row.value !== ''),
  ]

  if (!rows.length && !fitNotes && !measurements.derivedSize) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(0,77,64,0.12)',
        background: 'linear-gradient(135deg, rgba(0,77,64,0.03) 0%, rgba(212,175,55,0.03) 100%)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(0,77,64,0.08)' }}
      >
        <div className="h-3 w-0.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #D4AF37, #C8622A)' }} />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#7D6B41' }}>
          Outfit Measurements
        </p>
      </div>

      <div className="p-4 space-y-4">
        {measurements.derivedSize && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#9E9E7A' }}>
              Derived size
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'rgba(0,77,64,0.08)',
                color: '#004D40',
                border: '1px solid rgba(0,77,64,0.14)',
              }}
            >
              {measurements.derivedSize}
            </span>
          </div>
        )}

        {groupedBaseFields.length > 0 && (
          <div className="space-y-3">
            {groupedBaseFields.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#7D6B41' }}>
                  {section.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.fields.map((field) => {
                    const value = getMeasurementValue(measurementBuckets, field.key)
                    if (value === undefined || value === null || value === '') return null

                    return (
                      <div
                        key={field.key}
                        className="rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,77,64,0.08)' }}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#9E9E7A' }}>
                          {field.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: '#1A1A14' }}>
                          {formatMeasurementValue(value)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedExtraFields.length > 0 && (
          <div className="space-y-3">
            {groupedExtraFields.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#7D6B41' }}>
                  {section.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.fields.map((field) => {
                    const value = getMeasurementValue(measurementBuckets, field.key)
                    if (value === undefined || value === null || value === '') return null

                    return (
                      <div
                        key={field.key}
                        className="rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.78)', border: '1px solid rgba(0,77,64,0.08)' }}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#9E9E7A' }}>
                          {field.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: '#1A1A14' }}>
                          {formatMeasurementValue(value)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {fitNotes && (
          <div
            className="rounded-xl px-3 py-3"
            style={{ backgroundColor: 'rgba(0,77,64,0.05)', border: '1px solid rgba(0,77,64,0.08)' }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#9E9E7A' }}>
              Fit notes
            </p>
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word" style={{ color: '#4D4B3E' }}>
              {fitNotes}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ListingDetailsSection = ({ listing }) => {
  return (
    <div className="flex flex-col gap-4 md:gap-5">

      {/* Top row: badge + availability */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CategoryBadge category={listing.category} />
        <AvailabilityBadge isActive={listing.isActive} />
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
        className="text-2xl md:text-3xl lg:text-[2.1rem] font-black leading-tight"
        style={{ color: '#1A1A14', fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}
      >
        {listing.title}
      </motion.h1>

      {/* Gold accent line */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="h-0.5 w-16 rounded-sm"
        style={{ background: 'linear-gradient(90deg, #D4AF37, #C8622A, transparent)' }}
      />

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="text-sm md:text-[0.92rem] leading-relaxed"
        style={{ color: '#6A6A56', maxWidth: '420px' }}
      >
        {listing.description}
      </motion.p>

      <MeasurementsSection listing={listing} />

      {/* Location pill */}
      {listing.location && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="inline-flex items-center gap-2 w-fit"
        >
          <span className="text-sm">📍</span>
          <span
            className="text-xs font-semibold"
            style={{ color: '#9E9E7A' }}
          >
            {listing.location.area}{listing.location.city ? `, ${listing.location.city}` : ''}
          </span>
        </motion.div>
      )}
    </div>
  )
}

export default ListingDetailsSection