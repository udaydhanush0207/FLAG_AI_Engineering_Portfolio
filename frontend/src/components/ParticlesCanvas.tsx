import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  size: number; speed: number
  opacity: number; drift: number; phase: number
}

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 0.8 + Math.random() * 1.8,
    speed: 0.1 + Math.random() * 0.2,
    opacity: 0.08 + Math.random() * 0.22,
    drift: (Math.random() - 0.5) * 0.25,
    phase: Math.random() * Math.PI * 2,
  }
}

export default function ParticlesCanvas({ count = 30 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef  = useRef(0)
  const particles = useRef<Particle[]>([])
  const t = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles.current = Array.from({ length: count }, () =>
        makeParticle(canvas.width, canvas.height)
      )
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      t.current += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles.current) {
        const pulse = 0.5 + 0.5 * Math.sin(t.current + p.phase)
        const alpha = p.opacity * (0.7 + 0.3 * pulse)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.9 + 0.1 * pulse), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,162,39,${alpha})`
        ctx.fill()

        p.y -= p.speed
        p.x += p.drift

        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width }
        if (p.x < 0 || p.x > canvas.width) p.x = Math.random() * canvas.width
      }

      frameRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}
