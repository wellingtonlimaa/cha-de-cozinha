import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Gera um QR code SVG inline a partir de um valor.
 * Usa cores do tema marrom/dourado.
 */
export default function QrCode({ value, size = 160, label }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let cancelled = false
    QRCode.toString(value, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark:  '#5a3015',
        light: '#fffdf8',
      },
    }).then((s) => {
      if (!cancelled) setSvg(s)
    }).catch(() => {
      if (!cancelled) setSvg('')
    })
    return () => { cancelled = true }
  }, [value])

  return (
    <div className="qr-code" style={{ width: size, height: size }} aria-label={label || 'QR code'}>
      {svg
        ? <span dangerouslySetInnerHTML={{ __html: svg }} />
        : <span className="qr-code-fallback">…</span>
      }
    </div>
  )
}
