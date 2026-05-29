import Envelope from './Envelope'

export default function AttendanceSection({
  guest,
  onSubmit,
  submitting,
  onGoToGifts,
}) {
  return (
    <section className="content-section attendance-intro">
      <div className="section-head">
        <p className="kicker">
          {guest ? 'Sua presença' : 'Confirmação de presença'}
        </p>
        <h2>{guest ? 'Tudo certo!' : 'Você recebeu um convite'}</h2>
        {guest && (
          <p className="section-desc">
            Atualize seus dados a qualquer momento.
          </p>
        )}
      </div>

      <Envelope
        guest={guest}
        onSubmit={onSubmit}
        submitting={submitting}
      />

      {guest && (
        <button
          type="button"
          className="btn-outline goto-gifts-btn"
          onClick={onGoToGifts}
        >
          Ver lista de presentes
        </button>
      )}
    </section>
  )
}
