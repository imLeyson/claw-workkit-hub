import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: string, duration = 1200, start = false): string {
  const [current, setCurrent] = useState('0')
  const started = useRef(false)

  useEffect(() => {
    if (!start || started.current) return
    started.current = true

    // Parse target: handle numbers like "1,286" or "91"
    const numeric = parseInt(target.replace(/,/g, ''), 10)
    if (isNaN(numeric)) {
      setCurrent(target)
      return
    }

    const startTime = performance.now()
    const hasComma = target.includes(',')

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(numeric * eased)

      if (hasComma) {
        setCurrent(value.toLocaleString('en-US'))
      } else {
        setCurrent(String(value))
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCurrent(target)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, start])

  return current
}
