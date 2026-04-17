import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const PageLoadAnimation = ({ children }) => {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setShowContent(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageLoadAnimation
