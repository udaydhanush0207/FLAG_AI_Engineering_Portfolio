import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Simulate loading progress
    const steps = [
      { target: 30,  delay: 100 },
      { target: 60,  delay: 400 },
      { target: 80,  delay: 700 },
      { target: 95,  delay: 1100 },
      { target: 100, delay: 1500 },
    ]
    const timers: ReturnType<typeof setTimeout>[] = []
    steps.forEach(({ target, delay }) => {
      timers.push(setTimeout(() => setProgress(target), delay))
    })
    timers.push(setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 500)
    }, 2000))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
          style={{ background: '#060D1B' }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-40" />

          {/* Rotating outer ring */}
          <motion.div
            className="absolute"
            style={{
              width: 180, height: 180,
              border: '1px solid rgba(201,162,39,0.08)',
              borderTopColor: 'rgba(201,162,39,0.4)',
              borderRadius: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute"
            style={{
              width: 140, height: 140,
              border: '1px solid rgba(201,162,39,0.05)',
              borderBottomColor: 'rgba(201,162,39,0.25)',
              borderRadius: '50%',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center: FLAG logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          >
            {/* Crane icon */}
            <motion.div
              style={{ color: '#C9A227', fontSize: 36, lineHeight: 1 }}
              animate={{ rotateZ: [0, -5, 5, -5, 0] }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
            >
              🏗
            </motion.div>

            <div className="text-center">
              <div
                className="text-3xl font-black tracking-[0.3em] text-white uppercase"
                style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.35em' }}
              >
                FLAG
              </div>
              <div
                className="text-[9px] tracking-[0.4em] mt-1 uppercase"
                style={{ color: 'rgba(201,162,39,0.7)', fontFamily: 'JetBrains Mono, monospace' }}
              >
                AI Intelligence Platform
              </div>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48">
            <div
              className="h-px w-full overflow-hidden"
              style={{ background: 'rgba(201,162,39,0.1)' }}
            >
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, #7A6018, #C9A227, #F5D87A)', originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ ease: [0.16,1,0.3,1] }}
              />
            </div>
            <div
              className="text-center mt-2 text-[9px] font-mono"
              style={{ color: 'rgba(201,162,39,0.4)' }}
            >
              {progress}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
