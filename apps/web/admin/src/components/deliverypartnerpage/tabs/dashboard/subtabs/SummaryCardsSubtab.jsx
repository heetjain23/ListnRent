import React from 'react'
import { motion } from 'framer-motion'

const cards = [
  { title: 'Total Completed Deliveries', value: '24', note: '+12% vs yesterday', accent: false },
  { title: 'Total Pending Tasks', value: '8', note: 'Next task in 15 mins', accent: true },
  { title: 'Total Returns Completed', value: '12', note: 'Weekly completed returns', accent: false },
]

const SummaryCardsSubtab = () => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {cards.map((card) => (
        <motion.div
          key={card.title}
          whileHover={{ y: -4 }}
          className={`rounded-xl border p-4 ${
            card.accent
              ? 'border-teal-900 bg-teal-900 text-white'
              : 'border-stone-300 bg-[#f5f4e8] text-zinc-800'
          }`}
        >
          <p className={`text-[11px] font-bold uppercase tracking-wide ${card.accent ? 'text-teal-100' : 'text-stone-500'}`}>
            {card.title}
          </p>
          <p className="mt-2 text-5xl leading-none">{card.value}</p>
          <p className={`mt-2 text-sm ${card.accent ? 'text-teal-100' : 'text-stone-600'}`}>{card.note}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default SummaryCardsSubtab
