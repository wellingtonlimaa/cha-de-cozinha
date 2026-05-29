import { useEffect, useState } from 'react'

/**
 * Roteamento simples por hash (#/admin etc).
 * Não usamos react-router pois temos só duas "rotas".
 */
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '')

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash
}
