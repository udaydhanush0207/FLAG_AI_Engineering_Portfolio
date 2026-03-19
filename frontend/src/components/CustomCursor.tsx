import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos     = useRef({ x: -100, y: -100 })
  const ring    = useRef({ x: -100, y: -100 })
  const frame   = useRef(0)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = () => setIsHovering(true)
    const onLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    const addHover = () => {
      document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    addHover()
    const observer = new MutationObserver(addHover)
    observer.observe(document.body, { childList: true, subtree: true })

    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12)
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
      }
      if (ringRef.current) {
        const half = isHovering ? 26 : 16
        ringRef.current.style.transform = `translate(${ring.current.x - half}px, ${ring.current.y - half}px)`
      }
      frame.current = requestAnimationFrame(animate)
    }
    frame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame.current)
      observer.disconnect()
    }
  }, [isHovering])

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: isHovering ? 12 : 8,
          height: isHovering ? 12 : 8,
          background: isHovering ? '#F5D87A' : '#C9A227',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease',
          willChange: 'transform',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: isHovering ? 52 : 32,
          height: isHovering ? 52 : 32,
          border: `1.5px solid rgba(201,162,39,${isHovering ? 0.8 : 0.4})`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          willChange: 'transform',
        }}
      />
    </>
  )
}
