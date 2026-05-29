import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_ORDER, PRODUCTS_PER_PAGE } from '../lib/constants'
import { buildProductImage } from '../lib/imageBuilder'
import ProductCard from './ProductCard'
import SkeletonGrid from './SkeletonGrid'
import { SearchIcon } from './Decorations'

export default function GiftsSection({
  products,
  reservations,
  guest,
  actionState,
  onSelectProduct,
  loading = false,
  onlyMine: onlyMineProp,
  onChangeOnlyMine,
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [onlyMineLocal, setOnlyMineLocal] = useState(false)
  // Controlado externamente se a prop for fornecida
  const onlyMine = onlyMineProp !== undefined ? onlyMineProp : onlyMineLocal
  const setOnlyMine = onChangeOnlyMine ?? setOnlyMineLocal

  const enrichedProducts = useMemo(
    () => products.map((p) => ({
      ...p,
      image: p.imageUrl || buildProductImage(p.name, p.color, p.category),
      reservedBy: reservations[p.id] ?? null,
    })),
    [products, reservations],
  )

  const reservedCount = enrichedProducts.filter((p) => p.reservedBy).length

  const availableCategories = useMemo(
    () => ['Todas', ...CATEGORY_ORDER.filter((c) =>
      enrichedProducts.some((p) => p.category === c),
    )],
    [enrichedProducts],
  )

  const myReservationsCount = useMemo(
    () => guest
      ? enrichedProducts.filter((p) => p.reservedBy?.phone === guest.phone).length
      : 0,
    [enrichedProducts, guest],
  )

  const filteredProducts = useMemo(() => {
    let list = enrichedProducts

    if (onlyMine && guest) {
      list = list.filter((p) => p.reservedBy?.phone === guest.phone)
    }

    if (selectedCategory !== 'Todas') {
      list = list.filter((p) => p.category === selectedCategory)
    }

    const q = searchTerm.trim().toLowerCase()
    if (q) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q),
      )
    }

    return list
  }, [enrichedProducts, selectedCategory, searchTerm, onlyMine, guest])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))
  const paginated = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  )

  useEffect(() => { setCurrentPage(1) }, [selectedCategory, searchTerm, onlyMine])
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  // Se o usuário não tem mais reservas e o filtro "meus" está ligado, desliga
  useEffect(() => {
    if (onlyMine && myReservationsCount === 0) setOnlyMine(false)
  }, [myReservationsCount, onlyMine])

  function clearFilters() {
    setSelectedCategory('Todas')
    setSearchTerm('')
    setOnlyMine(false)
    setCurrentPage(1)
  }

  function changePage(page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="content-section gifts-section">
      <header className="gifts-header">
        <div className="gifts-title-block">
          <p className="kicker">Lista de Presentes</p>
          <h2>Escolha um presente para o casal</h2>
          <p className="section-desc">
            Reserve o item para que ninguém presenteie o mesmo. {guest && `Olá, ${guest.name.split(' ')[0]}!`}
          </p>
        </div>

        <div className="gifts-meta-row">
          <div className="gifts-meta-item">
            <strong>{products.length}</strong>
            <span>itens</span>
          </div>
          <span className="gifts-meta-sep" aria-hidden="true" />
          <div className="gifts-meta-item meta-available">
            <strong>{products.length - reservedCount}</strong>
            <span>disponíveis</span>
          </div>
          <span className="gifts-meta-sep" aria-hidden="true" />
          <div className="gifts-meta-item meta-reserved">
            <strong>{reservedCount}</strong>
            <span>reservados</span>
          </div>
        </div>

        <div className="gifts-toolbar">
          <div className="search-field">
            <SearchIcon />
            <input
              id="product-search"
              type="text"
              placeholder="Buscar por nome, categoria, cor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
              >×</button>
            )}
          </div>

          <div className="filter-row">
            {myReservationsCount > 0 && (
              <button
                type="button"
                className={`filter-chip filter-mine${onlyMine ? ' active' : ''}`}
                onClick={() => setOnlyMine((v) => !v)}
                aria-pressed={onlyMine}
              >
                ⭐ Meus reservados ({myReservationsCount})
              </button>
            )}
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip${selectedCategory === cat ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
            {(searchTerm || selectedCategory !== 'Todas' || onlyMine) && (
              <button type="button" className="filter-clear" onClick={clearFilters}>
                Limpar
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="results-bar">
        <span>
          {selectedCategory === 'Todas' ? 'Todos os itens' : selectedCategory}
          {searchTerm && ` · "${searchTerm}"`}
        </span>
        <span>{filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : (
        <div className="product-grid">
          {paginated.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              busy={actionState.productId === product.id}
              onClick={() => onSelectProduct(product)}
              guest={guest}
            />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="empty-state">
          <strong>Nenhum item encontrado</strong>
          <p>Tente outra categoria ou limpe os filtros.</p>
          <button type="button" className="btn-outline" onClick={clearFilters}>
            Mostrar todos
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Paginação">
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
          >← Anterior</button>
          <div className="page-nums">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`page-num${currentPage === p ? ' active' : ''}`}
                onClick={() => changePage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => changePage(currentPage + 1)}
          >Próxima →</button>
        </nav>
      )}
    </section>
  )
}
