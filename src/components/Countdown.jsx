import { useEffect, useState } from 'react'
import { useEvent } from './EventProvider'

const MONTH_INDEX = {
  janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4,
  junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
}

function deriveEventDate(e) {
  if (e.event_datetime) {
    const d = new Date(e.event_datetime)
    if (!Number.isNaN(d.getTime())) return d
  }
  // Fallback: monta a partir dos campos de exibição
  const m   = MONTH_INDEX[(e.month_label ?? '').toLowerCase().trim()]
  const day = parseInt(e.day_number, 10)
  const yr  = parseInt(e.year_label, 10)
  if (Number.isNaN(day) || Number.isNaN(yr) || m === undefined) return null
  const hourMatch = String(e.time_label ?? '').match(/(\d{1,2})/)
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 14
  return new Date(yr, m, day, hour, 0, 0)
}

function diffParts(eventDate, now) {
  let total = Math.max(0, Math.floor((eventDate.getTime() - now.getTime()) / 1000))
  const days = Math.floor(total / 86400);  total -= days  * 86400
  const hours = Math.floor(total / 3600);  total -= hours * 3600
  const mins  = Math.floor(total / 60);    total -= mins  * 60
  const secs  = total
  return { days, hours, mins, secs }
}

function pad(n) { return String(n).padStart(2, '0') }

function Unit({ value, label }) {
  const text = pad(value)
  return (
    <div className="countdown-unit">
      <strong className="countdown-num">
        {/* key força re-mount + replay da animação a cada mudança */}
        <span key={text} className="countdown-num-inner">{text}</span>
      </strong>
      <span className="countdown-unit-label">{label}</span>
    </div>
  )
}

export default function Countdown({ event }) {
  const fromContext = useEvent()
  const e = event ?? fromContext
  const eventDate = deriveEventDate(e)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!eventDate) return undefined
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [eventDate?.getTime()])

  if (!eventDate) return null

  const remaining = eventDate.getTime() - now.getTime()

  if (remaining <= 0) {
    // Verifica se está acontecendo (até 6h após o horário) ou já passou
    const sinceMs = -remaining
    if (sinceMs < 6 * 60 * 60 * 1000) {
      return (
        <div className="countdown countdown-now">
          <span className="countdown-now-text">Está acontecendo agora 🎉</span>
        </div>
      )
    }
    return (
      <div className="countdown countdown-past">
        <span>O evento já aconteceu — obrigado por celebrar com a gente</span>
      </div>
    )
  }

  const { days, hours, mins, secs } = diffParts(eventDate, now)

  return (
    <div className="countdown" role="timer" aria-label="Contagem regressiva">
      <span className="countdown-headline">faltam</span>
      <div className="countdown-units">
        <Unit value={days}  label={days === 1 ? 'dia' : 'dias'} />
        <span className="countdown-sep">:</span>
        <Unit value={hours} label="horas" />
        <span className="countdown-sep">:</span>
        <Unit value={mins}  label="min" />
        <span className="countdown-sep">:</span>
        <Unit value={secs}  label="seg" />
      </div>
    </div>
  )
}
