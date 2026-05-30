import { useEffect, useState } from 'react'
import { CloseIcon } from './Decorations'
import { useEvent } from './EventProvider'

export default function ProductModal({
  product,
  guest,
  busy,
  onClose,
  onReserve,
  onCancel,
  userReservationsCount = 0,
  onSeeMyReservations,
}) {
  const event = useEvent()
  const [confirmAction, setConfirmAction] = useState(null) // null | 'reserve' | 'cancel'
  const [justReserved, setJustReserved]   = useState(false)

  // Fecha com ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Bloqueia scroll do body
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Reseta ao trocar de produto
  useEffect(() => {
    setConfirmAction(null)
    setJustReserved(false)
  }, [product?.id])

  if (!product) return null
  const reservedByMe = product.reservedBy?.phone === guest?.phone

  async function handleReserveClick() {
    if (confirmAction !== 'reserve') {
      setConfirmAction('reserve')
      return
    }
    const result = await onReserve()
    if (result?.ok) {
      setJustReserved(true)
      setConfirmAction(null)
    }
  }

  function handleCancelClick() {
    if (confirmAction === 'cancel') {
      onCancel()
    } else {
      setConfirmAction('cancel')
    }
  }

  // Compartilhar via WhatsApp / Web Share
  function handleShare() {
    const inviteUrl = window.location.origin + window.location.pathname
    const text = `Acabei de reservar um presente para o chá de cozinha de ${event.couple_name}! ✨`
    const fullText = `${text}\n${inviteUrl}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Chá de Cozinha · ${event.couple_name}`,
        text,
        url: inviteUrl,
      }).catch(() => { /* usuário cancelou */ })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank', 'noreferrer')
    }
  }

  function handleSeeMine() {
    if (onSeeMyReservations) onSeeMyReservations()
    else onClose()
  }

  // ── TELA DE AGRADECIMENTO (após reservar) ────────────────────
  if (justReserved) {
    const total = userReservationsCount
    return (
      <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <div className="modal-box modal-box-success" onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>

          <div className="modal-success">
            <div className="modal-success-rays" aria-hidden="true" />
            <div className="modal-success-check">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="celebration-circle" />
                <path d="M30 52 L45 68 L72 36" fill="none" stroke="currentColor" strokeWidth="7"
                  strokeLinecap="round" strokeLinejoin="round" className="celebration-tick" />
              </svg>
            </div>

            <p className="kicker">Presente reservado</p>
            <h2 className="modal-success-title">Obrigado{guest?.name && `, ${guest.name.split(' ')[0]}`}!</h2>

            <div className="modal-success-product">
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category}{product.color ? ` · ${product.color}` : ''}</span>
              </div>
            </div>

            <p className="modal-success-summary">
              {total === 1
                ? 'Essa é sua primeira reserva! 🎉'
                : <>Você agora tem <strong>{total} presentes reservados</strong> para o casal.</>}
            </p>

            <div className="modal-success-actions">
              <button type="button" className="btn-primary" onClick={handleShare}>
                📤 Compartilhar este chá
              </button>
              {onSeeMyReservations && total > 0 && (
                <button type="button" className="btn-outline" onClick={handleSeeMine}>
                  ⭐ Ver minhas reservas
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={onClose}>
                Continuar escolhendo
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── TELA NORMAL (browse / reservar / cancelar) ──────────────
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <CloseIcon />
        </button>

        <div className="modal-img-wrap">
          <img src={product.image} alt="" className="modal-img" />
        </div>

        <div className="modal-content">
          <span className={`avail-tag${product.reservedBy ? ' taken' : ' free'}`}>
            {product.reservedBy
              ? reservedByMe
                ? '⭐ Você reservou este presente'
                : `Reservado por ${product.reservedBy.personName}`
              : 'Disponível para reserva'}
          </span>

          <p className="modal-category">{product.category}</p>
          <h3 className="modal-name">{product.name}</h3>
          {product.color && (
            <p className="modal-color">Cor sugerida: <strong>{product.color}</strong></p>
          )}

          <div className="modal-details">
            <div className="detail-row">
              <span>Código</span>
              <strong>{product.code}</strong>
            </div>
            {product.referenceLink && (
              <div className="detail-row">
                <span>Referência</span>
                <a href={product.referenceLink} target="_blank" rel="noreferrer">
                  Ver produto
                </a>
              </div>
            )}
            {product.reservedBy && (
              <div className="detail-row">
                <span>Reservado por</span>
                <strong>{product.reservedBy.personName}</strong>
              </div>
            )}
          </div>

          {product.reservedBy ? (
            reservedByMe ? (
              confirmAction === 'cancel' ? (
                <ConfirmStep
                  question="Tem certeza que quer cancelar sua reserva?"
                  hint="Outro convidado poderá reservar o presente."
                  primaryLabel={busy ? 'Cancelando...' : 'Sim, cancelar'}
                  primaryClass="btn-danger"
                  onPrimary={handleCancelClick}
                  onSecondary={() => setConfirmAction(null)}
                  busy={busy}
                />
              ) : (
                <button
                  className="btn-danger"
                  type="button"
                  onClick={handleCancelClick}
                  disabled={busy}
                >
                  Cancelar minha reserva
                </button>
              )
            ) : (
              <button className="btn-danger" type="button" disabled>
                Já reservado por outra pessoa
              </button>
            )
          ) : (
            confirmAction === 'reserve' ? (
              <ConfirmStep
                question={`Confirma a reserva de "${product.name}"?`}
                hint="Você se compromete a presentear o casal com esse item."
                primaryLabel={busy ? 'Reservando...' : 'Sim, reservar'}
                primaryClass="btn-primary"
                onPrimary={handleReserveClick}
                onSecondary={() => setConfirmAction(null)}
                busy={busy}
              />
            ) : (
              <button
                className="btn-primary"
                type="button"
                onClick={handleReserveClick}
                disabled={busy}
              >
                Reservar este presente
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmStep({ question, hint, primaryLabel, primaryClass, onPrimary, onSecondary, busy }) {
  return (
    <div className="modal-confirm" role="alertdialog">
      <p className="modal-confirm-question">{question}</p>
      {hint && <p className="modal-confirm-hint">{hint}</p>}
      <div className="modal-confirm-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={onSecondary}
          disabled={busy}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={primaryClass}
          onClick={onPrimary}
          disabled={busy}
          autoFocus
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
