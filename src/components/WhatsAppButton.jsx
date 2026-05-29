import { useEvent } from './EventProvider'

/**
 * Botão flutuante que abre o WhatsApp com mensagem pré-preenchida.
 * O telefone vem do painel admin (event_settings.whatsapp_number);
 * usa VITE_WHATSAPP_NUMBER como fallback se ainda não configurado.
 */
export default function WhatsAppButton() {
  const e = useEvent()
  const number = (e.whatsapp_number ?? '').replace(/\D/g, '')
  if (!number) return null

  const message = encodeURIComponent(
    `Oi! Tudo bem? Estou no site do chá de cozinha do(a) ${e.couple_name} e queria tirar uma dúvida.`,
  )
  const href = `https://wa.me/${number}?text=${message}`

  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.81 11.81 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.78 11.78 0 0 0 5.63 1.43h.01c6.55 0 11.85-5.3 11.85-11.84 0-3.16-1.23-6.13-3.37-8.43Zm-8.48 18.2h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.21-3.79 1 1.01-3.7-.23-.38a9.84 9.84 0 0 1-1.5-5.18C2.16 6.4 6.6 1.97 12.04 1.97c2.65 0 5.13 1.03 7 2.9a9.85 9.85 0 0 1 2.9 7c0 5.45-4.43 9.88-9.9 9.88Zm5.43-7.4c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.16 8.16 0 0 1-2.4-1.48 9.04 9.04 0 0 1-1.66-2.07c-.18-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.66-1.6-.9-2.18-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.12-.27-.2-.57-.34Z"/>
      </svg>
    </a>
  )
}
