import { useEffect, useState } from 'react'

/**
 * Toast simples com auto-dismiss.
 * Uso: const { toast, showToast } = useToast()
 *      showToast('Mensagem', 'success' | 'error' | 'default')
 */
export function useToast(durationMs = 3000) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const t = window.setTimeout(() => setToast(null), durationMs)
    return () => window.clearTimeout(t)
  }, [toast, durationMs])

  function showToast(message, kind = 'default') {
    setToast({ message, kind, key: Date.now() })
  }

  function dismiss() { setToast(null) }

  return { toast, showToast, dismiss }
}
