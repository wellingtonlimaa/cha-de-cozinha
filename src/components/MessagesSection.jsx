import { useState } from 'react'
import { useMessages } from './MessagesProvider'
import { formatDateTime } from '../lib/format'

export default function MessagesSection({ guest }) {
  const { messages, loading, createMessage } = useMessages()
  const [name, setName]           = useState(guest?.name ?? '')
  const [text, setText]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [sent, setSent]           = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    if (!name.trim() || !text.trim()) {
      setError('Preencha nome e mensagem')
      return
    }
    setSubmitting(true)
    setError('')

    const res = await createMessage({
      name: name.trim(),
      message: text.trim(),
      phone: guest?.phone ?? '',
    })

    setSubmitting(false)

    if (res.ok) {
      setText('')
      if (!guest) setName('')
      setSent(true)
      window.setTimeout(() => setSent(false), 2400)
    } else {
      setError('Não foi possível enviar. Tente novamente.')
    }
  }

  return (
    <section className="content-section messages-section">
      <div className="section-head">
        <p className="kicker">Recados</p>
        <h2>Deixe um recadinho para o casal</h2>
        <p className="section-desc">
          Uma palavra carinhosa, um voto, uma lembrança — qualquer coisa que queira compartilhar.
        </p>
      </div>

      <form className="messages-form" onSubmit={handleSubmit} noValidate>
        <label className="form-label">
          <span>Seu nome</span>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Quem está escrevendo?"
            disabled={!!guest}
            required
          />
        </label>
        <label className="form-label">
          <span>Sua mensagem</span>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => { setText(e.target.value); setError('') }}
            placeholder="Escreva aqui sua mensagem para o casal..."
            maxLength={500}
            required
          />
          <span className="messages-counter">{text.length}/500</span>
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="messages-form-actions">
          {sent && <span className="messages-sent-flag">✓ Enviado!</span>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar mensagem'}
          </button>
        </div>
      </form>

      <div className="messages-divider" aria-hidden="true">
        <span className="messages-divider-line" />
        <span className="messages-divider-label">
          {messages.length} {messages.length === 1 ? 'recadinho' : 'recadinhos'}
        </span>
        <span className="messages-divider-line" />
      </div>

      {loading ? (
        <div className="admin-loading"><span className="spinner" /></div>
      ) : messages.length === 0 ? (
        <div className="empty-state">
          <strong>Ainda sem recadinhos</strong>
          <p>Seja a primeira pessoa a deixar uma mensagem!</p>
        </div>
      ) : (
        <ul className="messages-list">
          {messages.map((m, i) => (
            <li key={m.id} className="message-card" style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}>
              <div className="message-header">
                <strong>{m.name}</strong>
                <span>{formatDateTime(m.created_at)}</span>
              </div>
              <p>{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
