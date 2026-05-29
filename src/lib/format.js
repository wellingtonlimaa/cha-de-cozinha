// ────────────────────────────────────────────────────────────
// Helpers de formatação
// ────────────────────────────────────────────────────────────

/**
 * Formata um telefone brasileiro enquanto digita.
 * Aceita 10 (fixo) ou 11 (celular) dígitos.
 * Ex.: "11999998888" → "(11) 99999-8888"
 */
export function maskPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2)  return `(${digits}`
  if (digits.length <= 6)  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/**
 * Telefone só com dígitos — usado pra comparações/links do WhatsApp.
 */
export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

/**
 * Verifica se o telefone tem 10 ou 11 dígitos.
 */
export function isValidPhone(value) {
  const d = digitsOnly(value)
  return d.length === 10 || d.length === 11
}

/**
 * Formata data ISO em algo legível PT-BR.
 * Ex.: "2026-05-08T14:30:00Z" → "08/05/2026 11:30"
 */
export function formatDateTime(iso) {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '-' }
}

/**
 * Gera CSV (RFC 4180) a partir de um array de objetos.
 * Faz escape de aspas e novas linhas.
 */
export function toCSV(rows, columns) {
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const head = columns.map((c) => escape(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => escape(c.get(r))).join(',')).join('\n')
  return `${head}\n${body}`
}

/**
 * Dispara download de um arquivo CSV no navegador.
 */
export function downloadCSV(filename, csv) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
