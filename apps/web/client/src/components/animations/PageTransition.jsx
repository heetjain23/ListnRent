import React from 'react'
import { motion } from 'motion/react'

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.992, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, scale: 0.996, filter: 'blur(5px)' }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
