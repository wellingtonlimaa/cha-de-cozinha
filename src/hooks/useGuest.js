import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ATTENDEE_KEY } from '../lib/constants'
import { digitsOnly } from '../lib/format'

function loadStored() {
  const stored = localStorage.getItem(ATTENDEE_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    // Garante que telefones antigos (com máscara) virem dígitos
    if (parsed && parsed.phone) {
      parsed.phone = digitsOnly(parsed.phone)
    }
    return parsed
  } catch { return null }
}

/**
 * Gerencia estado do convidado:
 * - lê / escreve em localStorage para identidade local
 * - persiste confirmação no Supabase (tabela `guests`)
 * - sempre armazena telefone como dígitos-puros (a UI aplica máscara)
 */
export function useGuest() {
  const [guest, setGuestState] = useState(loadStored)

  useEffect(() => {
    if (guest) localStorage.setItem(ATTENDEE_KEY, JSON.stringify(guest))
    else localStorage.removeItem(ATTENDEE_KEY)
  }, [guest])

  async function confirm({ name, phone, guests }) {
    const trimmedName = (name ?? '').trim()
    const phoneDigits = digitsOnly(phone)
    if (!trimmedName || !phoneDigits) {
      return { ok: false, reason: 'invalid-input' }
    }

    const row = {
      phone: phoneDigits,
      name: trimmedName,
      guests_count: parseInt(guests ?? '1', 10) || 1,
    }

    // Insere; se o telefone já confirmou antes (conflito de PK), atualiza.
    // Evita upsert de propósito: upsert exigiria policy de SELECT pública,
    // mas a leitura de `guests` é restrita ao admin (privacidade).
    let { error } = await supabase.from('guests').insert(row)
    if (error?.code === '23505') {
      const upd = await supabase.from('guests').update(row).eq('phone', phoneDigits)
      error = upd.error
    }

    if (error) return { ok: false, reason: 'unknown', error }

    const next = { name: trimmedName, phone: phoneDigits, guests: guests ?? '1' }
    setGuestState(next)
    return { ok: true, guest: next }
  }

  function clear() {
    setGuestState(null)
  }

  return { guest, confirm, clear }
}
