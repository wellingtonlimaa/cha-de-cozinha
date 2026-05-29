import { useEffect, useState } from 'react'
import QrCode from './QrCode'
import { useEvent } from './EventProvider'

export default function PixSection() {
  const e = useEvent()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const t = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(t)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(e.pix_key)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (!e.pix_key) return null

  return (
    <footer className="pix-section">
      <div className="pix-content">
        <p className="kicker">Presente em dinheiro</p>
        <h2>Prefere contribuir via PIX?</h2>
        <p className="section-desc">
          Se preferir enviar um valor em vez de um item da lista, escaneie o
          QR code ou copie a chave abaixo.
        </p>

        <div className="pix-card">
          <div className="pix-qr">
            <QrCode value={e.pix_key} size={160} label="QR code do PIX" />
          </div>
          <div className="pix-card-info">
            <span className="pix-label">Chave PIX</span>
            <strong className="pix-value">{e.pix_key}</strong>
            <button
              type="button"
              className={`btn-primary pix-copy-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copiada' : 'Copiar chave'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
