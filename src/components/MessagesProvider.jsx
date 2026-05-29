import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const MessagesContext = createContext(null)

/**
 * Provê a lista de recadinhos com:
 * - Carregamento inicial + realtime
 * - Atualização otimista no envio/remoção
 */
export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    let channel   = null

    async function load() {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (!error && data) setMessages(data)
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[messages] erro:', err?.message ?? err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => load(),
        )
        .subscribe()
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[messages] realtime indisponível:', err?.message ?? err)
      }
    }

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function createMessage({ name, message, phone }) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        name:    String(name ?? '').trim(),
        message: String(message ?? '').trim(),
        phone:   String(phone ?? '').replace(/\D/g, ''),
      })
      .select()
      .single()

    if (error) return { ok: false, error }
    setMessages((cur) => [data, ...cur])
    return { ok: true, message: data }
  }

  async function deleteMessage(id) {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) return { ok: false, error }
    setMessages((cur) => cur.filter((m) => m.id !== id))
    return { ok: true }
  }

  return (
    <MessagesContext.Provider value={{ messages, loading, createMessage, deleteMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider')
  return ctx
}
