import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DeliveryPartnerSidebar from './DeliveryPartnerSidebar'

const DeliveryPartnerLayout = ({ activeTab, setActiveTab, navTabs, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-[#fbfaee] text-teal-950 lg:grid lg:grid-cols-[240px_1fr]">
      <DeliveryPartnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navTabs={navTabs}
        onLogout={onLogout}
      />

      <main className="bg-[#fbfaee] p-4 sm:p-5 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default DeliveryPartnerLayout
