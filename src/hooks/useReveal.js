import { useEffect, useRef, useState } from 'react'

/**
 * Detecta quando o elemento entra na viewport e marca como "revealed".
 * Usa IntersectionObserver com fallback (sempre visível) em ambientes sem suporte.
 */
export function useReveal({ threshold = 0.15, once = true } = {}) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return undefined
    }

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setRevealed(false)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return [ref, revealed]
}
