import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/**
 * CursorFollower
 * Global custom cursor — renders on desktop only.
 * Mount this once at the app root (e.g. inside App.jsx, above <AnimatedRoutes>).
 */
const CursorFollower = () => {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 80, damping: 15 })
  const sy = useSpring(y, { stiffness: 80, damping: 15 })
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (!visible) setVisible(true)
    }
    const down = () => setActive(true)
    const up = () => setActive(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [visible])

  return (
    <>
      {/* Outer ring — springs behind the cursor */}
      <motion.div
        className="pointer-events-none fixed z-9999 h-10 w-10 rounded-full border-[1.5px] border-[rgba(212,175,55,0.5)]"
        style={{
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          scale: active ? 0.6 : 1,
          transition: 'scale 0.15s',
        }}
      />
      {/* Inner dot — follows exactly */}
      <motion.div
        className="pointer-events-none fixed z-9999 h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  )
}

export default CursorFollower