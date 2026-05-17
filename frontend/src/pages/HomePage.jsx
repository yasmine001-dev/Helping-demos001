import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['All', 'men', 'women', 'kids', 'accessories']
const SORTS = [
  { label: 'Latest', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (category !== 'All') params.category = category
      if (sort) params.sort = sort
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      const { data } = await api.get('/products', { params })
      setProducts(data.data || data.products || data || []);
    } catch (err) {
      setError('Failed to load products')
    } finally { setLoading(false) }
  }, [category, sort, minPrice, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = search
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full" style={{
              width: `${300 + i * 200}px`, height: `${300 + i * 200}px`,
              top: '50%', left: '30%', transform: 'translate(-50%, -50%)'
            }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-0.5 bg-gold" />
              <span className="text-gold text-xs uppercase tracking-[4px] font-body">New Collection</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl text-white leading-tight mb-6">
              Dress for the<br />
              <span className="italic text-gold">Moment</span>
            </h1>
            <p className="text-white/60 font-body text-lg mb-10 leading-relaxed">
              Discover our curated selection of premium fashion pieces designed for the modern lifestyle.
            </p>
            <button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
              className="btn-gold uppercase tracking-widest text-sm">
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 py-4">
            {/* Category tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-body transition-all ${
                    category === cat
                      ? 'bg-navy text-white'
                      : 'text-navy/60 hover:text-navy hover:bg-gray-50'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-200 text-sm font-body focus:outline-none focus:border-navy w-48" />
              </div>

              {/* Price range */}
              <div className="flex items-center gap-2">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min $"
                  className="w-20 border border-gray-200 px-2 py-2 text-sm font-body focus:outline-none focus:border-navy" />
                <span className="text-gray-400 text-sm">—</span>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max $"
                  className="w-20 border border-gray-200 px-2 py-2 text-sm font-body focus:outline-none focus:border-navy" />
              </div>

              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="border border-gray-200 px-3 py-2 text-sm font-body focus:outline-none focus:border-navy bg-white">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl text-navy">{category === 'All' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            {!loading && <p className="text-gray-400 font-body text-sm mt-1">{filtered.length} items</p>}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-body">{error}</p>
            <button onClick={fetchProducts} className="btn-outline mt-4">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="font-display text-2xl text-navy mb-2">No products found</p>
            <p className="text-gray-400 font-body">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
