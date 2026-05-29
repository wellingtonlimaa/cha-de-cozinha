// =============================================================
// Edge Function: notify-reservation
// Recebe um webhook do Supabase quando uma nova linha é inserida
// na tabela `reservations` e dispara um email pro casal via Resend.
//
// Variáveis de ambiente necessárias (configuradas no Supabase):
//   RESEND_API_KEY     — chave da sua conta Resend (resend.com)
//   ADMIN_EMAIL        — destino do email (ex: casal@gmail.com)
//   FROM_EMAIL         — remetente (ex: noreply@seudominio.com)
//   SITE_URL           — URL do site (opcional, para link no email)
//
// Deploy:
//   supabase functions deploy notify-reservation --no-verify-jwt
//
// Configurar webhook:
//   Supabase Dashboard → Database → Webhooks → Create
//   - Nome: notify-on-reservation
//   - Tabela: reservations
//   - Eventos: INSERT
//   - Tipo: HTTP Request
//   - URL: https://<seu-project>.supabase.co/functions/v1/notify-reservation
//   - HTTP Headers: nada (a função usa --no-verify-jwt)
// =============================================================

// @ts-ignore — Deno runtime
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

interface ReservationPayload {
  type: 'INSERT'
  table: 'reservations'
  record: {
    product_id: number
    person_name: string
    phone: string
    reserved_at: string
  }
  schema: string
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL    = Deno.env.get('ADMIN_EMAIL')    ?? ''
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'onboarding@resend.dev'
const SITE_URL       = Deno.env.get('SITE_URL')       ?? ''

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')              ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

async function fetchProduct(productId: number) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=name,category,color`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  )
  if (!resp.ok) return null
  const rows = await resp.json()
  return rows[0] ?? null
}

function maskPhoneBR(value: string) {
  const d = value.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return value
}

function buildEmailHtml(opts: {
  product: { name?: string, category?: string, color?: string } | null
  reservation: ReservationPayload['record']
}) {
  const productName = opts.product?.name ?? `Produto #${opts.reservation.product_id}`
  const formattedPhone = maskPhoneBR(opts.reservation.phone)
  const formattedDate = new Date(opts.reservation.reserved_at)
    .toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return `
    <div style="font-family:Manrope,Arial,sans-serif;background:#f7f2ea;padding:32px 16px;color:#2a1c0e;">
      <div style="max-width:520px;margin:0 auto;background:#fffdf8;border-radius:18px;padding:32px;border:1px solid rgba(120,68,28,0.13);">
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b8884a;font-weight:700;margin:0 0 8px;">
          Chá de Cozinha · Nova reserva
        </p>
        <h1 style="font-family:Georgia,serif;color:#5a3015;margin:0 0 16px;font-size:24px;">
          ${escapeHtml(opts.reservation.person_name)} reservou um presente!
        </h1>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);color:#6e5038;font-size:13px;">Presente</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);font-weight:700;text-align:right;">${escapeHtml(productName)}</td>
          </tr>
          ${opts.product?.category ? `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);color:#6e5038;font-size:13px;">Categoria</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);text-align:right;">${escapeHtml(opts.product.category)}</td>
          </tr>` : ''}
          ${opts.product?.color ? `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);color:#6e5038;font-size:13px;">Cor</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);text-align:right;">${escapeHtml(opts.product.color)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);color:#6e5038;font-size:13px;">Telefone</td>
            <td style="padding:10px 0;border-bottom:1px solid rgba(120,68,28,0.12);text-align:right;">${escapeHtml(formattedPhone)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6e5038;font-size:13px;">Quando</td>
            <td style="padding:10px 0;text-align:right;">${escapeHtml(formattedDate)}</td>
          </tr>
        </table>
        ${SITE_URL ? `
        <a href="${SITE_URL}#/admin"
           style="display:inline-block;margin-top:24px;padding:12px 22px;background:linear-gradient(135deg,#8c6035,#c09050);color:#fff9f0;text-decoration:none;border-radius:999px;font-weight:700;">
          Abrir painel admin
        </a>` : ''}
        <p style="margin-top:24px;font-size:12px;color:#a07c5a;">
          Você está recebendo isso porque é o organizador do chá de cozinha.
        </p>
      </div>
    </div>
  `
}

function escapeHtml(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let payload: ReservationPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (payload.type !== 'INSERT' || payload.table !== 'reservations' || !payload.record) {
    return new Response('Ignored: not a reservation INSERT', { status: 200 })
  }

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error('[notify-reservation] Missing RESEND_API_KEY or ADMIN_EMAIL')
    return new Response('Misconfigured', { status: 500 })
  }

  const product = await fetchProduct(payload.record.product_id)
  const html = buildEmailHtml({ product, reservation: payload.record })

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎁 ${payload.record.person_name} reservou um presente`,
      html,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    console.error('[notify-reservation] Resend error:', text)
    return new Response('Failed to send email', { status: 502 })
  }

  return new Response('OK', { status: 200 })
})
