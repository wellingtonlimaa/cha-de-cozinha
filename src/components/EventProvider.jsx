import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { COUPLE_NAME, COUPLE_MONOGRAM, PIX_KEY, EVENT_INFO } from '../lib/constants'

const EventContext = createContext(null)

const DEFAULTS = {
  couple_name:      COUPLE_NAME,
  couple_monogram:  COUPLE_MONOGRAM,
  couple_photo_url: '',
  pix_key:          PIX_KEY,
  day_label:        EVENT_INFO.dayLabel,
  time_label:       EVENT_INFO.timeLabel,
  month_label:      EVENT_INFO.monthLabel,
  year_label:       EVENT_INFO.yearLabel,
  day_number:       EVENT_INFO.dayNumber,
  address:          EVENT_INFO.address,
  maps_link:        EVENT_INFO.mapsLink,
  message:          EVENT_INFO.message,
  whatsapp_number:  import.meta.env.VITE_WHATSAPP_NUMBER ?? '',
  event_datetime:   null,
}

/**
 * Provê configurações do evento para toda a árvore.
 * - Uma única conexão Supabase Realtime compartilhada
 * - Update otimista (mudança aparece imediatamente em todos os lugares)
 * - Fallback nas constants se a tabela não existir
 */
export function EventProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    let channel   = null

    async function load() {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle()
        if (cancelled) return
        if (!error && data) {
          setSettings({ ...DEFAULTS, ...data })
        }
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[event_settings] usando defaults:', err?.message ?? err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('event-settings-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_settings' },
          (payload) => {
            if (payload.new) {
              setSettings((cur) => ({ ...cur, ...payload.new }))
            }
          },
        )
        .subscribe()
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[event_settings] realtime indisponível:', err?.message ?? err)
      }
    }

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function updateSettings(patch) {
    const { error } = await supabase
      .from('event_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) return { ok: false, error }

    // Atualização otimista — site reflete na hora
    setSettings((cur) => ({ ...cur, ...patch }))
    return { ok: true }
  }

  return (
    <EventContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvent must be used within EventProvider')
  return ctx.settings
}

export function useEventLoading() {
  const ctx = useContext(EventContext)
  return ctx?.loading ?? false
}

export function useUpdateEvent() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useUpdateEvent must be used within EventProvider')
  return ctx.updateSettings
}
