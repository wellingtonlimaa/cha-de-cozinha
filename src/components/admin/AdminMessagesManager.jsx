import { useMessages } from '../MessagesProvider'
import { formatDateTime, maskPhone } from '../../lib/format'

export default function AdminMessagesManager({ onToast }) {
  const { messages, loading, deleteMessage } = useMessages()

  async function handleDelete(m) {
    const ok = window.confirm(`Remover a mensagem de "${m.name}"?`)
    if (!ok) return
    const res = await deleteMessage(m.id)
    if (res.ok) onToast?.('Mensagem removida', 'default')
    else        onToast?.('Erro ao remover', 'error')
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhum recadinho ainda</strong>
        <p>Quando os convidados deixarem mensagens, elas aparecem aqui.</p>
      </div>
    )
  }

  return (
    <div className="admin-messages">
      {messages.map((m) => (
        <div key={m.id} className="admin-message-row">
          <div className="admin-message-content">
            <div className="admin-message-meta">
              <strong>{m.name}</strong>
              <span>{formatDateTime(m.created_at)}</span>
              {m.phone && <span className="admin-message-phone">{maskPhone(m.phone)}</span>}
            </div>
            <p>{m.message}</p>
          </div>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => handleDelete(m)}
          >
            Remover
          </button>
        </div>
      ))}
    </div>
  )
}
