import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { products as fallbackProducts } from '../data/products'

const ProductsContext = createContext(null)

function normalize(p) {
  return {
    id:            p.id,
    code:          p.code,
    name:          p.name,
    category:      p.category,
    color:         p.color,
    imageUrl:      p.image_url ?? '',
    referenceLink: p.reference_link ?? '',
    sortOrder:     p.sort_order ?? 0,
  }
}

function buildProductFromForm(data) {
  return {
    id:            parseInt(data.id, 10),
    code:          data.code,
    name:          data.name,
    category:      data.category,
    color:         data.color,
    imageUrl:      data.imageUrl ?? '',
    referenceLink: data.referenceLink ?? '',
    sortOrder:     data.sortOrder ?? data.id,
  }
}

/**
 * Provê a lista de produtos para a árvore inteira, com:
 * - Uma única conexão de leitura + realtime
 * - CRUD com atualização otimista (UI atualiza instantaneamente)
 * - Fallback no array local se a tabela não existir
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    let channel   = null

    async function load() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true })
        if (cancelled) return
        if (!error && data && data.length > 0) {
          setProducts(data.map(normalize))
        }
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[products] usando fallback:', err?.message ?? err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    try {
      channel = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => load(),
        )
        .subscribe()
    } catch (err) {
      if (typeof console !== 'undefined') {
        console.warn('[products] realtime indisponível:', err?.message ?? err)
      }
    }

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function createProduct(data) {
    const optimistic = buildProductFromForm(data)
    const { error } = await supabase.from('products').insert({
      id:             optimistic.id,
      code:           optimistic.code,
      name:           optimistic.name,
      category:       optimistic.category,
      color:          optimistic.color,
      image_url:      optimistic.imageUrl,
      reference_link: optimistic.referenceLink,
      sort_order:     optimistic.sortOrder,
    })
    if (error) return { ok: false, error }

    // Atualização otimista — UI responde na hora
    setProducts((cur) => {
      const next = [...cur, optimistic]
      next.sort((a, b) => a.sortOrder - b.sortOrder)
      return next
    })
    return { ok: true }
  }

  async function updateProduct(id, data) {
    const patch = {
      code:           data.code,
      name:           data.name,
      category:       data.category,
      color:          data.color,
      image_url:      data.imageUrl ?? '',
      reference_link: data.referenceLink ?? '',
      sort_order:     data.sortOrder,
    }
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])

    const { error } = await supabase.from('products').update(patch).eq('id', id)
    if (error) return { ok: false, error }

    setProducts((cur) =>
      cur.map((p) => p.id === id ? {
        ...p,
        code:          data.code          ?? p.code,
        name:          data.name          ?? p.name,
        category:      data.category      ?? p.category,
        color:         data.color         ?? p.color,
        imageUrl:      data.imageUrl      ?? p.imageUrl,
        referenceLink: data.referenceLink ?? p.referenceLink,
        sortOrder:     data.sortOrder     ?? p.sortOrder,
      } : p),
    )
    return { ok: true }
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { ok: false, error }

    setProducts((cur) => cur.filter((p) => p.id !== id))
    return { ok: true }
  }

  function suggestNextId() {
    const maxId = products.reduce((m, p) => Math.max(m, p.id), 0)
    return maxId + 1
  }

  /**
   * Recebe a lista completa de produtos na nova ordem desejada.
   * Atualiza a ordem local na hora (otimista) e dispara updates em paralelo.
   */
  async function reorderProducts(newOrder) {
    // Atualização otimista — UI já reflete a nova ordem
    const reindexed = newOrder.map((p, i) => ({ ...p, sortOrder: i + 1 }))
    setProducts(reindexed)

    // Dispara updates em paralelo
    const updates = reindexed.map((p) =>
      supabase.from('products').update({ sort_order: p.sortOrder }).eq('id', p.id),
    )
    const results = await Promise.all(updates)
    const firstError = results.find((r) => r.error)?.error
    return { ok: !firstError, error: firstError }
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        createProduct,
        updateProduct,
        deleteProduct,
        reorderProducts,
        suggestNextId,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
