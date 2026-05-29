import { useEvent } from './EventProvider'

export default function HomeSection({ guest, hasReservation, onNavigate }) {
  const e = useEvent()
  const firstName = guest?.name?.split(' ')[0]

  return (
    <section className="content-section home-section">
      <div className="section-head">
        <p className="kicker">Boas-vindas</p>
        <h2>{firstName ? `Que bom ter você aqui, ${firstName}!` : 'Que bom ter você aqui'}</h2>
        <p className="section-desc">
          {hasReservation
            ? `Tudo pronto! Você já confirmou presença e reservou seu presente para ${e.couple_name}.`
            : guest
            ? 'Sua presença está confirmada. Agora é só escolher um presente da lista.'
            : 'Acompanhe seu progresso pelos passos acima ou navegue pelos atalhos abaixo.'}
        </p>
      </div>

      <div className="home-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate(guest ? 'gifts' : 'attendance')}
        >
          {guest ? 'Ver lista de presentes' : 'Confirmar minha presença'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => onNavigate('location')}
        >
          Ver como chegar
        </button>
      </div>
    </section>
  )
}
