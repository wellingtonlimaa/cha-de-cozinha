import { useState } from 'react'
import { useEvent } from './EventProvider'

function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.52 3.48A11.81 11.81 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.78 11.78 0 0 0 5.63 1.43h.01c6.55 0 11.85-5.3 11.85-11.84 0-3.16-1.23-6.13-3.37-8.43Zm-8.48 18.2h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.21-3.79 1 1.01-3.7-.23-.38a9.84 9.84 0 0 1-1.5-5.18C2.16 6.4 6.6 1.97 12.04 1.97c2.65 0 5.13 1.03 7 2.9a9.85 9.85 0 0 1 2.9 7c0 5.45-4.43 9.88-9.9 9.88Z"/>
    </svg>
  )
}

function PrintIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="9" rx="2" />
      <rect x="6" y="14" width="12" height="6" />
    </svg>
  )
}

export default function ShareToolbar() {
  const e = useEvent()
  const [copied, setCopied] = useState(false)

  const inviteUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  const shareText = `Você está convidado(a) para o chá de cozinha de ${e.couple_name}! Confirme presença e veja a lista de presentes:`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function shareViaWhatsApp() {
    const text = encodeURIComponent(`${shareText}\n${inviteUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noreferrer')
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chá de Cozinha · ${e.couple_name}`,
          text: shareText,
          url: inviteUrl,
        })
      } catch { /* usuário cancelou — sem problema */ }
    } else {
      copyLink()
    }
  }

  function printInvite() {
    document.body.classList.add('is-printing')
    window.print()
    // listener para limpar a classe após o print
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('is-printing')
    }, { once: true })
  }

  return (
    <div className="share-toolbar" aria-label="Ações do convite">
      <button
        type="button"
        className={`share-btn${copied ? ' is-copied' : ''}`}
        onClick={copyLink}
        aria-label="Copiar link do convite"
      >
        <CopyIcon />
        <span>{copied ? 'Link copiado!' : 'Copiar link'}</span>
      </button>

      <button
        type="button"
        className="share-btn share-btn-whatsapp"
        onClick={shareViaWhatsApp}
        aria-label="Compartilhar via WhatsApp"
      >
        <WhatsAppIcon />
        <span>Compartilhar</span>
      </button>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          type="button"
          className="share-btn"
          onClick={shareNative}
          aria-label="Compartilhar via sistema"
        >
          <span>Mais opções</span>
        </button>
      )}

      <button
        type="button"
        className="share-btn"
        onClick={printInvite}
        aria-label="Imprimir convite"
      >
        <PrintIcon />
        <span>Imprimir</span>
      </button>
    </div>
  )
}
