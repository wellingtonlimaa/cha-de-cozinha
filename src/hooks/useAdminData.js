import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Busca todos os dados de admin (convidados confirmados + reservas).
 * Reusa o canal realtime — qualquer mudança atualiza o painel.
 */
export function useAdminData(enabled = true) {
  const [guests, setGuests] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    setLoading(true)

    async function load() {
      const [g, r] = await Promise.all([
        supabase.from('guests').select('*').order('confirmed_at', { ascending: false }),
        supabase.from('reservations').select('*').order('reserved_at', { ascending: false }),
      ])
      if (cancelled) return
      if (g.error || r.error) {
        setError(g.error || r.error)
      } else {
        setGuests(g.data || [])
        setReservations(r.data || [])
      }
      setLoading(false)
    }

    load()

    const ch = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' },       load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(ch)
    }
  }, [enabled])

  return { guests, reservations, loading, error }
}
