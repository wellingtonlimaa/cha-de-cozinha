/**
 * Verifica se uma string é uma URL válida (http/https).
 * Retorna `null` para valor vazio (estado neutro).
 */
export function isValidUrl(value) {
  const v = String(value ?? '').trim()
  if (!v) return null
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Converte ISO timestamp para o formato aceito por <input type="datetime-local">.
 * Ex.: "2026-06-07T14:00:00.000Z" → "2026-06-07T14:00"
 */
export function isoToDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const h  = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd}T${h}:${mi}`
}

/**
 * Converte input datetime-local de volta para ISO.
 */
export function datetimeLocalToIso(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}
