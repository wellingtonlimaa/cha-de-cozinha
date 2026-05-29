import { CheckIcon } from './Decorations'

/**
 * Indicador de progresso do convidado.
 * Estados: future (cinza) → current (dourado pulsante) → done (marrom com check).
 * As linhas conectoras vão se preenchendo de marrom conforme avança.
 */
export default function Stepper({ guest, reservations, onStepClick }) {
  const userPhone = guest?.phone
  const hasReservation = !!userPhone &&
    Object.values(reservations).some((r) => r.phone === userPhone)

  const steps = [
    { id: 'attendance', num: 1, label: 'Confirme', sublabel: 'sua presença' },
    { id: 'gifts',      num: 2, label: 'Reserve',  sublabel: 'um presente' },
    { id: 'done',       num: 3, label: 'Pronto!',  sublabel: 'tudo certo' },
  ]

  steps[0].status = guest ? 'done' : 'current'
  steps[1].status = hasReservation ? 'done' : (guest ? 'current' : 'future')
  steps[2].status = hasReservation ? 'current' : 'future'

  return (
    <ol className="stepper" aria-label="Seu progresso">
      {steps.map((s) => {
        const interactive = s.id !== 'done' && s.status !== 'future'
        return (
          <li key={s.id} className={`step step-${s.status}`}>
            <button
              type="button"
              className="step-bullet"
              onClick={() => interactive && onStepClick?.(s.id)}
              disabled={!interactive}
              aria-current={s.status === 'current' ? 'step' : undefined}
              aria-label={`${s.label} ${s.sublabel}`}
            >
              {s.status === 'done' ? <CheckIcon /> : <span>{s.num}</span>}
            </button>
            <div className="step-text">
              <strong>{s.label}</strong>
              <span>{s.sublabel}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
