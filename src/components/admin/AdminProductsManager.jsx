import { useMemo, useState } from 'react'
import { CATEGORY_ORDER } from '../../lib/constants'
import { buildProductImage } from '../../lib/imageBuilder'
import { useProducts } from '../ProductsProvider'
import { useReservations } from '../../hooks/useReservations'
import { supabase } from '../../lib/supabase'

const COLORS = ['Bege', 'Bambu', 'Branco', 'Cinza', 'Inox', 'Marrom', 'Preto', 'Verde oliva']

const EMPTY = {
  id: null,
  code: '',
  name: '',
  category: CATEGORY_ORDER[0],
  color: 'Bege',
  imageUrl: '',
  referenceLink: '',
}

export default function AdminProductsManager({ onToast }) {
  const {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
    suggestNextId,
  } = useProducts()
  const { reservations }        = useReservations()
  const [editing, setEditing]   = useState(null)   // null | productObj
  const [busyId, setBusyId]     = useState(null)
  const [filter, setFilter]     = useState('')
  const [dragId, setDragId]     = useState(null)
  const [hoverId, setHoverId]   = useState(null)

  const reservedIds = useMemo(
    () => new Set(Object.keys(reservations).map((k) => parseInt(k, 10))),
    [reservations],
  )

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.color || '').toLowerCase().includes(q),
    )
  }, [products, filter])

  function handleNew() {
    const nextId = suggestNextId()
    setEditing({ ...EMPTY, id: nextId, code: `CC-${String(nextId).padStart(3, '0')}` })
  }

  function handleEdit(p) {
    setEditing({ ...p })
  }

  async function handleDelete(p) {
    if (reservedIds.has(p.id)) {
      onToast?.(
        `"${p.name}" está reservado. Cancele a reserva primeiro.`,
        'error',
      )
      return
    }
    const ok = window.confirm(`Remover "${p.name}" da lista?`)
    if (!ok) return

    setBusyId(p.id)
    const res = await deleteProduct(p.id)
    setBusyId(null)
    if (res.ok) onToast?.('Produto removido', 'default')
    else        onToast?.('Erro ao remover', 'error')
  }

  async function handleSave(data) {
    setBusyId(data.id)
    let res
    if (products.some((p) => p.id === data.id)) {
      res = await updateProduct(data.id, data)
    } else {
      res = await createProduct(data)
    }
    setBusyId(null)
    if (res.ok) {
      onToast?.('Produto salvo', 'success')
      setEditing(null)
    } else {
      onToast?.(res.error?.code === '23505'
        ? 'Já existe um produto com esse ID'
        : 'Erro ao salvar', 'error')
    }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" /></div>

  // Drag handlers
  const isFiltered = filter.trim().length > 0

  function onDragStart(id) {
    return (e) => {
      setDragId(id)
      e.dataTransfer.effectAllowed = 'move'
      // Necessário em Firefox
      e.dataTransfer.setData('text/plain', String(id))
    }
  }
  function onDragOver(id) {
    return (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (id !== hoverId) setHoverId(id)
    }
  }
  function onDragEnd() {
    setDragId(null)
    setHoverId(null)
  }
  async function onDrop(targetId) {
    if (dragId === null || dragId === targetId) {
      onDragEnd()
      return
    }
    const fromIdx = products.findIndex((p) => p.id === dragId)
    const toIdx   = products.findIndex((p) => p.id === targetId)
    if (fromIdx === -1 || toIdx === -1) {
      onDragEnd()
      return
    }
    const reordered = [...products]
    const [moved]   = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    onDragEnd()
    const res = await reorderProducts(reordered)
    if (!res.ok) onToast?.('Erro ao reordenar. Tente novamente.', 'error')
    else         onToast?.('Ordem atualizada', 'default')
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-products-search"
        />
        <button type="button" className="btn-primary" onClick={handleNew}>
          + Adicionar produto
        </button>
      </div>

      {!isFiltered && (
        <p className="admin-products-hint">
          Arraste pelo ícone <span className="drag-hint-icon">⋮⋮</span> para reordenar a lista.
        </p>
      )}

      <div className="admin-products-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><strong>Nenhum produto encontrado</strong></div>
        ) : filtered.map((p) => {
          const reserved = reservedIds.has(p.id)
          const image = p.imageUrl || buildProductImage(p.name, p.color, p.category)
          const isDragging = dragId === p.id
          const isHover    = hoverId === p.id && dragId !== null && dragId !== p.id
          const draggable  = !isFiltered

          return (
            <div
              key={p.id}
              className={`admin-product-row${isDragging ? ' is-dragging' : ''}${isHover ? ' is-drop-target' : ''}`}
              draggable={draggable}
              onDragStart={draggable ? onDragStart(p.id) : undefined}
              onDragOver={draggable ? onDragOver(p.id) : undefined}
              onDragEnd={draggable ? onDragEnd : undefined}
              onDrop={draggable ? () => onDrop(p.id) : undefined}
            >
              {draggable && (
                <span className="admin-product-handle" aria-hidden="true" title="Arrastar para reordenar">⋮⋮</span>
              )}
              <img src={image} alt="" className="admin-product-thumb" loading="lazy" />
              <div className="admin-product-info">
                <span className="admin-product-meta">{p.code} · {p.category}{p.color ? ` · ${p.color}` : ''}</span>
                <strong className="admin-product-name">{p.name}</strong>
                {p.referenceLink && (
                  <a className="admin-product-link"
                    href={p.referenceLink} target="_blank" rel="noreferrer">
                    Ver referência ↗
                  </a>
                )}
              </div>
              <div className="admin-product-status">
                {reserved
                  ? <span className="badge-reserved">Reservado</span>
                  : <span className="badge-available">Disponível</span>}
              </div>
              <div className="admin-product-actions">
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  onClick={() => handleEdit(p)}
                  disabled={busyId === p.id}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => handleDelete(p)}
                  disabled={busyId === p.id || reserved}
                  title={reserved ? 'Cancele a reserva primeiro' : 'Remover'}
                >
                  Remover
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <ProductFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function ProductFormModal({ initial, onClose, onSave }) {
  const [form, setForm]         = useState(initial)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reenviar o mesmo arquivo depois
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
    const path = `produtos/${form.id || 'novo'}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) {
      setUploading(false)
      setUploadError('Falha ao enviar. Tente novamente.')
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm((f) => ({ ...f, imageUrl: data.publicUrl }))
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      id: parseInt(form.id, 10),
      sortOrder: form.sortOrder ?? form.id,
    })
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box admin-product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={onClose} aria-label="Fechar">×</button>

        <div className="modal-content">
          <p className="kicker">{form.id && initial.code ? 'Editar produto' : 'Novo produto'}</p>
          <h3 className="modal-name">{form.name || 'Sem nome'}</h3>

          <form onSubmit={handleSubmit} className="admin-product-form">
            <div className="admin-form-row">
              <label className="admin-field">
                <span className="admin-field-label">ID</span>
                <input
                  type="number"
                  value={form.id ?? ''}
                  onChange={update('id')}
                  required
                  min="1"
                />
                <span className="admin-field-hint">Único. Não troque depois de criado.</span>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Código</span>
                <input type="text" value={form.code} onChange={update('code')} required />
              </label>
            </div>

            <label className="admin-field admin-field-wide">
              <span className="admin-field-label">Nome</span>
              <input type="text" value={form.name} onChange={update('name')} required />
            </label>

            <div className="admin-form-row">
              <label className="admin-field">
                <span className="admin-field-label">Categoria</span>
                <select value={form.category} onChange={update('category')}>
                  {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Cor sugerida</span>
                <select value={form.color ?? ''} onChange={update('color')}>
                  <option value="">— Sem cor (opcional) —</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="admin-field-hint">Opcional. Se vazio, não mostra cor e a ilustração usa um tom neutro.</span>
              </label>
            </div>

            <div className="admin-field admin-field-wide">
              <span className="admin-field-label">Imagem do produto (opcional)</span>
              <div className="admin-image-upload">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="" className="admin-image-preview" />
                  : <div className="admin-image-placeholder">Sem imagem<br />(usa ilustração gerada)</div>}
                <div className="admin-image-actions">
                  <label className={`btn-outline btn-sm admin-image-btn${uploading ? ' is-busy' : ''}`}>
                    {uploading ? 'Enviando…' : '📷 Enviar imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      disabled={uploading}
                      hidden
                    />
                  </label>
                  {form.imageUrl && !uploading && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              {uploadError && <span className="admin-image-error">{uploadError}</span>}
              <input
                type="url"
                value={form.imageUrl ?? ''}
                onChange={update('imageUrl')}
                placeholder="ou cole uma URL: https://..."
              />
              <span className="admin-field-hint">Envie uma foto ou cole uma URL. Se vazio, mostra a ilustração gerada.</span>
            </div>

            <label className="admin-field admin-field-wide">
              <span className="admin-field-label">Link de referência</span>
              <input
                type="url"
                value={form.referenceLink ?? ''}
                onChange={update('referenceLink')}
                placeholder="https://..."
              />
              <span className="admin-field-hint">Onde os convidados podem ver/comprar o produto.</span>
            </label>

            <div className="admin-event-actions">
              <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
