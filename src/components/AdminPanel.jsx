import { useMemo, useState } from 'react'
import { useAdminData } from '../hooks/useAdminData'
import { useProducts } from './ProductsProvider'
import { useEvent } from './EventProvider'
import { maskPhone, formatDateTime, toCSV, downloadCSV } from '../lib/format'
import { useToast } from '../hooks/useToast'
import Toast from './Toast'
import AdminEventForm from './admin/AdminEventForm'
import AdminProductsManager from './admin/AdminProductsManager'
import AdminMessagesManager from './admin/AdminMessagesManager'
import { useMessages } from './MessagesProvider'

const ADMIN_KEY = 'cha-admin-unlocked'

function PasswordGate({ onUnlock }) {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!expected) {
      setError('Painel admin não configurado. Defina VITE_ADMIN_PASSWORD no .env')
      return
    }
    if (pwd === expected) {
      sessionStorage.setItem(ADMIN_KEY, '1')
      onUnlock()
    } else {
      setError('Senha incorreta')
      setPwd('')
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <p className="kicker">Painel administrativo</p>
        <h1>Acesso restrito</h1>
        <p className="section-desc">Informe a senha para acessar.</p>
        <form onSubmit={handleSubmit} className="admin-gate-form">
          <input
            type="password"
            placeholder="Senha"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError('') }}
            autoFocus
            required
          />
          <button type="submit" className="btn-primary">Entrar</button>
        </form>
        {error && <p className="admin-gate-error">{error}</p>}
        <a href="#/" className="admin-gate-back">← Voltar para o site</a>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
      {sub && <span className="admin-stat-sub">{sub}</span>}
    </div>
  )
}

const TABS = [
  { id: 'guests',       label: 'Confirmações' },
  { id: 'reservations', label: 'Reservas' },
  { id: 'products',     label: 'Produtos' },
  { id: 'messages',     label: 'Recados' },
  { id: 'event',        label: 'Informações do evento' },
]

export default function AdminPanel() {
  const isUnlocked = sessionStorage.getItem(ADMIN_KEY) === '1'
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [tab, setTab] = useState('guests')

  const { guests, reservations, loading } = useAdminData(unlocked)
  const { products }                      = useProducts()
  const { messages }                      = useMessages()
  const settings                          = useEvent()
  const { toast, showToast }              = useToast()

  const productMap = useMemo(() => {
    const m = new Map()
    for (const p of products) m.set(p.id, p)
    return m
  }, [products])

  const totalPeople = useMemo(
    () => guests.reduce((s, g) => s + (g.guests_count || 1), 0),
    [guests],
  )

  function logout() {
    sessionStorage.removeItem(ADMIN_KEY)
    setUnlocked(false)
  }

  function exportGuestsCSV() {
    const csv = toCSV(guests, [
      { label: 'Nome',          get: (g) => g.name },
      { label: 'Telefone',      get: (g) => maskPhone(g.phone) },
      { label: 'Pessoas',       get: (g) => g.guests_count },
      { label: 'Confirmado em', get: (g) => formatDateTime(g.confirmed_at) },
    ])
    downloadCSV('confirmacoes.csv', csv)
  }

  function exportReservationsCSV() {
    const csv = toCSV(reservations, [
      { label: 'Presente',      get: (r) => productMap.get(r.product_id)?.name ?? `#${r.product_id}` },
      { label: 'Categoria',     get: (r) => productMap.get(r.product_id)?.category ?? '-' },
      { label: 'Cor',           get: (r) => productMap.get(r.product_id)?.color ?? '-' },
      { label: 'Reservado por', get: (r) => r.person_name },
      { label: 'Telefone',      get: (r) => maskPhone(r.phone) },
      { label: 'Reservado em',  get: (r) => formatDateTime(r.reserved_at) },
    ])
    downloadCSV('reservas.csv', csv)
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="kicker">Painel administrativo</p>
          <h1>{settings.couple_name}</h1>
        </div>
        <div className="admin-header-actions">
          <a href="#/" className="btn-outline">Ver site</a>
          <button type="button" className="btn-outline" onClick={logout}>Sair</button>
        </div>
      </header>

      <div className="admin-stats">
        <StatCard
          label="Confirmações"
          value={guests.length}
          sub={`${totalPeople} ${totalPeople === 1 ? 'pessoa' : 'pessoas'} no total`}
        />
        <StatCard
          label="Presentes"
          value={`${reservations.length}/${products.length}`}
          sub={`${products.length - reservations.length} disponíveis`}
        />
        <StatCard
          label="Conclusão"
          value={`${products.length === 0
            ? 0
            : Math.round((reservations.length / products.length) * 100)}%`}
          sub="da lista reservada"
        />
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && tab !== 'event' && tab !== 'products' && (
        <div className="admin-loading"><span className="spinner" /></div>
      )}

      {!loading && tab === 'guests' && (
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Quem confirmou</h2>
            <button type="button" className="btn-outline" onClick={exportGuestsCSV}>
              Exportar CSV
            </button>
          </div>
          {guests.length === 0 ? (
            <div className="empty-state"><strong>Ninguém confirmou ainda</strong></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Nome</th><th>Telefone</th><th>Pessoas</th><th>Confirmado em</th></tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.phone}>
                    <td>{g.name}</td>
                    <td>{maskPhone(g.phone)}</td>
                    <td>{g.guests_count}</td>
                    <td>{formatDateTime(g.confirmed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!loading && tab === 'reservations' && (
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Presentes reservados</h2>
            <button type="button" className="btn-outline" onClick={exportReservationsCSV}>
              Exportar CSV
            </button>
          </div>
          {reservations.length === 0 ? (
            <div className="empty-state"><strong>Nenhuma reserva ainda</strong></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Presente</th><th>Cor</th><th>Reservado por</th><th>Telefone</th><th>Quando</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const p = productMap.get(r.product_id)
                  return (
                    <tr key={r.product_id}>
                      <td>
                        <strong>{p?.name ?? `#${r.product_id}`}</strong>
                        {p && <small>{p.category}</small>}
                      </td>
                      <td>{p?.color ?? '-'}</td>
                      <td>{r.person_name}</td>
                      <td>{maskPhone(r.phone)}</td>
                      <td>{formatDateTime(r.reserved_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Lista de presentes</h2>
            <span className="admin-table-meta">{products.length} produtos cadastrados</span>
          </div>
          <div className="admin-table-body">
            <AdminProductsManager onToast={showToast} />
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Recados dos convidados</h2>
            <span className="admin-table-meta">{messages.length} {messages.length === 1 ? 'recadinho' : 'recadinhos'}</span>
          </div>
          <div className="admin-table-body">
            <AdminMessagesManager onToast={showToast} />
          </div>
        </div>
      )}

      {tab === 'event' && (
        <div className="admin-table-wrap">
          <div className="admin-table-head">
            <h2>Informações do evento</h2>
            <span className="admin-table-meta">As mudanças aparecem no site na hora.</span>
          </div>
          <div className="admin-table-body">
            <AdminEventForm onToast={showToast} />
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
