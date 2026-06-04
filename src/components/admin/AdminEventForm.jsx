import { useEffect, useState } from 'react'
import { useEvent, useUpdateEvent } from '../EventProvider'
import { isValidUrl, isoToDatetimeLocal, datetimeLocalToIso } from '../../lib/validation'
import { HeroView } from '../Hero'
import { supabase } from '../../lib/supabase'

const FIELDS = [
  { key: 'couple_name',      label: 'Nome do casal',     hint: 'Ex.: Manu & Vitor' },
  { key: 'couple_monogram',  label: 'Monograma',         hint: 'Sigla curta usada na navbar e ícones. Ex.: M&V' },
  { key: 'couple_photo_url', label: 'Foto do casal', type: 'url', upload: true,
    hint: 'Envie uma foto ou cole uma URL. Aparece no convite. Deixe vazio para usar o monograma.' },
  { key: 'message',          label: 'Mensagem do convite', textarea: true,
    hint: 'Texto completo que aparece no hero, ao lado do nome.' },
  { key: 'event_datetime',   label: 'Data e hora exata do evento', type: 'datetime-local',
    hint: 'Define o contador regressivo no convite ("faltam X dias").' },
  { key: 'day_label',        label: 'Dia da semana (texto)', hint: 'Ex.: domingo' },
  { key: 'day_number',       label: 'Dia do mês (texto)',    hint: 'Ex.: 07' },
  { key: 'month_label',      label: 'Mês (texto)',           hint: 'Ex.: junho' },
  { key: 'year_label',       label: 'Ano (texto)',           hint: 'Ex.: 2026' },
  { key: 'time_label',       label: 'Horário (texto)',       hint: 'Ex.: às 14h' },
  { key: 'address',          label: 'Endereço completo', textarea: true,
    hint: 'Rua, número, bairro, cidade, CEP.' },
  { key: 'maps_link',        label: 'Link do Google Maps', type: 'url',
    hint: 'Cole a URL completa do Google Maps. Deixe vazio para gerar automaticamente do endereço.' },
  { key: 'pix_key',          label: 'Chave PIX',         hint: 'CPF, e-mail, telefone ou aleatória.' },
  { key: 'whatsapp_number',  label: 'WhatsApp do organizador',
    hint: 'Telefone com DDI, só dígitos. Ex.: 5511999998888. Deixe vazio para esconder o botão verde.' },
]

function UrlValidationIndicator({ value }) {
  const valid = isValidUrl(value)
  if (valid === null) return null
  return (
    <span className={`url-status ${valid ? 'is-valid' : 'is-invalid'}`}>
      {valid ? '✓ URL válida' : '✗ URL inválida (precisa começar com http:// ou https://)'}
    </span>
  )
}

export default function AdminEventForm({ onToast }) {
  const settings              = useEvent()
  const updateSettings        = useUpdateEvent()
  const [form, setForm]       = useState(settings)
  const [saving, setSaving]   = useState(false)
  const [dirty, setDirty]     = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!dirty) setForm(settings)
  }, [settings, dirty])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function handlePhotoFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Imagem muito grande (máximo 5 MB).')
      return
    }
    setUploadError('')
    setUploading(true)
    const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `casal/foto-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      setUploading(false)
      setUploadError('Falha ao enviar. Tente novamente.')
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    update('couple_photo_url', data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const patch = {}
    for (const { key } of FIELDS) {
      patch[key] = form[key] ?? ''
    }
    if (!patch.event_datetime) patch.event_datetime = null
    const res = await updateSettings(patch)
    setSaving(false)
    if (res.ok) {
      setDirty(false)
      onToast?.('Informações atualizadas', 'success')
    } else {
      onToast?.('Erro ao salvar. Tente novamente.', 'error')
    }
  }

  function handleReset() {
    setForm(settings)
    setDirty(false)
  }

  return (
    <div className={`admin-event-layout${previewOpen ? ' has-preview' : ''}`}>
      <form className="admin-event-form" onSubmit={handleSubmit}>
        <div className="admin-event-form-head">
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => setPreviewOpen((v) => !v)}
          >
            {previewOpen ? 'Esconder preview' : '👁 Ver preview ao vivo'}
          </button>
          {dirty && <span className="admin-event-dirty">● Mudanças não salvas</span>}
        </div>

        <div className="admin-event-grid">
          {FIELDS.map((f) => {
            const isDateTime = f.type === 'datetime-local'
            const isUrl      = f.type === 'url'
            const value      = isDateTime
              ? isoToDatetimeLocal(form[f.key])
              : (form[f.key] ?? '')

            function onChange(e) {
              const v = isDateTime ? datetimeLocalToIso(e.target.value) : e.target.value
              update(f.key, v)
            }

            if (f.upload) {
              return (
                <div key={f.key} className="admin-field admin-field-wide">
                  <span className="admin-field-label">{f.label}</span>
                  <div className="admin-image-upload">
                    {form[f.key]
                      ? <img src={form[f.key]} alt="" className="admin-image-preview" />
                      : <div className="admin-image-placeholder">Sem foto<br />(usa o monograma)</div>}
                    <div className="admin-image-actions">
                      <label className={`btn-outline btn-sm admin-image-btn${uploading ? ' is-busy' : ''}`}>
                        {uploading ? 'Enviando…' : '📷 Enviar foto'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFile}
                          disabled={uploading}
                          hidden
                        />
                      </label>
                      {form[f.key] && !uploading && (
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => update(f.key, '')}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                  {uploadError && <span className="admin-image-error">{uploadError}</span>}
                  <input
                    type="url"
                    value={value}
                    onChange={onChange}
                    placeholder="ou cole uma URL: https://..."
                  />
                  <UrlValidationIndicator value={form[f.key]} />
                  {f.hint && <span className="admin-field-hint">{f.hint}</span>}
                </div>
              )
            }

            return (
              <label key={f.key} className={`admin-field${f.textarea ? ' admin-field-wide' : ''}`}>
                <span className="admin-field-label">{f.label}</span>
                {f.textarea ? (
                  <textarea rows={3} value={value} onChange={onChange} />
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    value={value}
                    onChange={onChange}
                    placeholder={isUrl ? 'https://...' : undefined}
                  />
                )}
                {isUrl && <UrlValidationIndicator value={form[f.key]} />}
                {f.hint && <span className="admin-field-hint">{f.hint}</span>}
              </label>
            )
          })}
        </div>

        <div className="admin-event-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={handleReset}
            disabled={!dirty || saving}
          >
            Cancelar alterações
          </button>
          <button type="submit" className="btn-primary" disabled={!dirty || saving}>
            {saving ? 'Salvando...' : 'Salvar informações'}
          </button>
        </div>
      </form>

      {previewOpen && (
        <aside className="admin-event-preview">
          <div className="admin-event-preview-head">
            <span className="kicker">Preview ao vivo</span>
            <span className="admin-event-preview-hint">
              É como o convite vai aparecer no site
            </span>
          </div>
          <div className="admin-event-preview-frame">
            <HeroView event={form} preview />
          </div>
        </aside>
      )}
    </div>
  )
}
