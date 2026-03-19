import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  drift: number
}

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1 + Math.random() * 2,
    speed: 0.15 + Math.random() * 0.25,
    opacity: 0.15 + Math.random() * 0.4,
    drift: (Math.random() - 0.5) * 0.3,
  }
}

export default function ParticlesCanvas({ count = 35 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles.current = Array.from({ length: count }, () =>
        makeParticle(canvas.width, canvas.height)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles.current) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,162,39,${p.opacity})`
        ctx.fill()

        p.y -= p.speed
        p.x += p.drift

        if (p.y < -5) {
          p.y = canvas.height + 5
          p.x = Math.random() * canvas.width
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
