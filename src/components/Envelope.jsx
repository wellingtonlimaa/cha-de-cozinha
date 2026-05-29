import { useState } from 'react'
import { useEvent } from './EventProvider'
import { maskPhone, isValidPhone } from '../lib/format'

/**
 * Envelope que abre revelando a carta acima dele com o formulário dentro.
 * Inspirado no padrão de "convite virtual" — envelope fica fixo no rodapé,
 * carta sobe por cima quando clica.
 */
export default function Envelope({ guest, onSubmit, submitting }) {
  const e = useEvent()
  const [open, setOpen] = useState(!!guest) // se já confirmou, abre direto
  const [form, setForm] = useState(() =>
    guest
      ? { name: guest.name, phone: maskPhone(guest.phone), guests: guest.guests ?? '1' }
      : { name: '', phone: '', guests: '1' },
  )
  const [phoneError, setPhoneError] = useState('')

  function handleStageClick(ev) {
    if (ev.target.closest('.invite-letter-inner')) return
    if (!open) setOpen(true)
  }

  function handleStageKeyDown(ev) {
    if (open) return
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      setOpen(true)
    }
  }

  function update(field) {
    return (ev) => {
      const value = field === 'phone' ? maskPhone(ev.target.value) : ev.target.value
      setForm((c) => ({ ...c, [field]: value }))
      if (field === 'phone') setPhoneError('')
    }
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (submitting) return
    if (!isValidPhone(form.phone)) {
      setPhoneError('Telefone incompleto')
      return
    }
    await onSubmit(form)
  }

  return (
    <div
      className={`invite-stage${open ? ' is-open' : ''}`}
      onClick={handleStageClick}
      onKeyDown={handleStageKeyDown}
      role={open ? undefined : 'button'}
      tabIndex={open ? -1 : 0}
      aria-label={open ? undefined : 'Abrir convite'}
    >
      {/* CARTA */}
      <div className="invite-letter">
        <div className="invite-letter-inner" onClick={(ev) => ev.stopPropagation()}>
          {guest && (
            <span className="invite-stamp" aria-hidden="true">
              <span>Confirmado</span>
            </span>
          )}
          <span className="invite-tag">você foi convidado(a)</span>
          <h3 className="invite-title">Chá de Cozinha</h3>
          <p className="invite-sub">{e.couple_name}</p>

          <div className="invite-divider">
            <span aria-hidden="true" />
            <em>❀</em>
            <span aria-hidden="true" />
          </div>

          <form className="invite-form" onSubmit={handleSubmit} noValidate>
            <div className="invite-field">
              <label>Seu nome completo</label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Como você se chama?"
                autoComplete="name"
                required
              />
            </div>

            <div className="invite-field-row">
              <div className={`invite-field${phoneError ? ' has-error' : ''}`}>
                <label>Telefone</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  maxLength={16}
                  required
                />
                {phoneError && <span className="invite-error">{phoneError}</span>}
              </div>

              <div className="invite-field">
                <label>Pessoas</label>
                <select value={form.guests} onChange={update('guests')}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="invite-submit" disabled={submitting}>
              {submitting ? 'Salvando…' : guest ? 'Atualizar ✿' : 'Confirmar presença ✿'}
            </button>
          </form>
        </div>
      </div>

      {/* ENVELOPE */}
      <div className="invite-envelope">
        <svg className="invite-env-body" viewBox="0 0 400 300" preserveAspectRatio="none">
          <rect x="0" y="0" width="400" height="300" rx="10" fill="#e8d4ad" />
          <polygon points="0,0 200,165 0,300"     fill="#d8c498" opacity="0.7" />
          <polygon points="400,0 200,165 400,300" fill="#cbb88a" opacity="0.7" />
          <polygon points="0,300 200,165 400,300" fill="#e0cba1" opacity="0.85" />
          <rect x="0.5" y="0.5" width="399" height="299" rx="9.5"
            fill="none" stroke="rgba(120,80,40,0.32)" strokeWidth="1" />
        </svg>

        <svg className="invite-flap" viewBox="0 0 400 155" preserveAspectRatio="none">
          <polygon points="0,0 400,0 200,155" fill="#dec99e" />
          <line x1="0"   y1="0" x2="200" y2="155" stroke="rgba(120,80,40,0.4)" strokeWidth="1" />
          <line x1="400" y1="0" x2="200" y2="155" stroke="rgba(120,80,40,0.4)" strokeWidth="1" />
        </svg>

        <div className="invite-seal" aria-hidden="true">
          <span>{e.couple_monogram}</span>
        </div>
      </div>

      {!open && (
        <p className="invite-hint" aria-hidden="true">
          ✉ toque no envelope para abrir
        </p>
      )}
    </div>
  )
}
