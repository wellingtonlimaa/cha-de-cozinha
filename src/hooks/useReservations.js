import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Carrega reservas do Supabase, escuta mudanças em tempo real
 * e expõe ações para reservar / cancelar.
 */
export function useReservations() {
  const [reservations, setReservations] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase.from('reservations').select('*')
      if (cancelled) return
      if (!error && data) {
        const map = {}
        for (const r of data) {
          map[r.product_id] = {
            personName: r.person_name,
            phone: r.phone,
            reservedAt: r.reserved_at,
          }
        }
        setReservations(map)
      }
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations' },
        (payload) => {
          const r = payload.new
          setReservations((cur) => ({
            ...cur,
            [r.product_id]: {
              personName: r.person_name,
              phone: r.phone,
              reservedAt: r.reserved_at,
            },
          }))
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reservations' },
        (payload) => {
          const id = payload.old.product_id
          setReservations((cur) => {
            const n = { ...cur }
            delete n[id]
            return n
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  async function reserve(productId, guest) {
    if (!guest) return { ok: false, reason: 'no-guest' }

    const { error } = await supabase.from('reservations').insert({
      product_id: productId,
      person_name: guest.name,
      phone: guest.phone,
    })

    if (error) {
      if (error.code === '23505') return { ok: false, reason: 'already-reserved' }
      return { ok: false, reason: 'unknown', error }
    }

    setReservations((cur) => ({
      ...cur,
      [productId]: {
        personName: guest.name,
        phone: guest.phone,
        reservedAt: new Date().toISOString(),
      },
    }))
    return { ok: true }
  }

  async function cancel(productId, guest) {
    if (!guest) return { ok: false, reason: 'no-guest' }
    if (reservations[productId]?.phone !== guest.phone) {
      return { ok: false, reason: 'not-owner' }
    }

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('product_id', productId)
      .eq('phone', guest.phone)

    if (error) return { ok: false, reason: 'unknown', error }

    setReservations((cur) => {
      const n = { ...cur }
      delete n[productId]
      return n
    })
    return { ok: true }
  }

  return { reservations, loading, reserve, cancel }
}
