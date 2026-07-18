import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { dbService, Product } from '../services/db';
import { useCart } from '../context/CartContext';
import { Search, X, SlidersHorizontal, ChevronRight, HelpCircle } from 'lucide-react';

export const getProductImage = (product: { image_url?: string; category?: string }) => {
  if (product.image_url) return product.image_url;
  switch (product.category) {
    case 'Fertilizantes':
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop';
    case 'Ventilación y Clima':
      return 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?q=80&w=600&auto=format&fit=crop';
    case 'Medición':
      return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop';
    case 'Sustratos y Medios':
      return 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop';
    case 'Macetas':
      return 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop';
    case 'Riego':
      return 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop';
    case 'Control de Plagas':
      return 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop';
    case 'Iluminación':
      return 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=600&auto=format&fit=crop';
    case 'Parafernalia':
      return 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop';
    default:
      return '/fondoletras.png';
  }
};

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart, sessionToken } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // FILTER STATE
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const catParam = searchParams.get('categoria') || '';
    const searchParam = searchParams.get('buscar') || '';
    
    setSelectedCategory(catParam);
    setSearchTerm(searchParam);
    
    // Fetch products
    dbService.getProducts().then(res => {
      setProducts(res);
      
      // Get unique categories and brands for filter lists
      const uniqueCats = Array.from(new Set(res.map(p => p.category))).sort();
      const uniqueBrands = Array.from(new Set(res.map(p => p.brand))).sort();
      setCategories(uniqueCats);
      setBrands(uniqueBrands);
    });
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand
    if (selectedBrand) {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Difficulty
    if (selectedDifficulty) {
      result = result.filter(p => p.difficulty_level === selectedDifficulty);
    }

    // Price range
    if (priceMin) {
      result = result.filter(p => (p.promotional_price || p.price) >= Number(priceMin));
    }
    if (priceMax) {
      result = result.filter(p => (p.promotional_price || p.price) <= Number(priceMax));
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.promotional_price || a.price) - (b.promotional_price || b.price));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.promotional_price || b.price) - (a.promotional_price || a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Relevance / default order (by ID or default)
      result.sort((a, b) => a.id.localeCompare(b.id));
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedDifficulty, priceMin, priceMax, sortBy]);

  const handleProductAdd = async (product: Product) => {
    await addToCart(product, 1);
    alert(`¡"${product.name}" agregado al carrito!`);
  };

  const handleCategorySelect = (cat: string) => {
    setSearchParams(prev => {
      if (cat) prev.set('categoria', cat);
      else prev.delete('categoria');
      return prev;
    });
    dbService.logEvent(sessionToken, 'filter_category', { category: cat });
  };

  const clearAllFilters = () => {
    setSelectedBrand('');
    setSelectedDifficulty('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('relevance');
    setSearchParams({});
    setSearchTerm('');
  };

  return (
    <div className="container">
      
      {/* Category header for SEO & Context */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--accent-neon)' }}>Inicio</Link>
          <ChevronRight size={12} />
          <span>Tienda</span>
          {selectedCategory && (
            <>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-primary)' }}>{selectedCategory}</span>
            </>
          )}
        </div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', marginBottom: '8px', fontWeight: 800 }}>
          {selectedCategory || 'Todos los Productos'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
          {selectedCategory === 'Fertilizantes' && 'Nutrición de alto rendimiento. Encontrá estimulantes radiculares, aditivos para floración pesada y reguladores para optimizar la cosecha.'}
          {selectedCategory === 'Ventilación y Clima' && 'Controlá temperatura, humedad y olores de tu indoor. Extractores a turbina, lineales, ductos de aluminio y filtros de carbón activo.'}
          {selectedCategory === 'Hidroponía' && 'Sistemas de cultivo hidropónico sin tierra, baldes DWC, aireadores de flujo continuo y soluciones nutritivas completas para raíces sumergidas.'}
          {selectedCategory === 'Medición' && 'Medidores digitales de pH y conductividad eléctrica (EC) para riego equilibrado, y balanzas de alta precisión para aditivos concentrados.'}
          {selectedCategory === 'Sustratos y Medios' && 'Medios de cultivo orgánicos e inertes con excelente retención de agua y oxigenación para un rápido desarrollo radicular.'}
          {!selectedCategory && 'Explorá nuestro catálogo con 205 insumos y equipamiento profesional con asesoramiento poscompra garantizado.'}
        </p>
      </div>

      {/* Main Grid: Filters Sidebar (Desktop) + Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }} className="shop-layout">
        
        {/* FILTERS SIDEBAR - DESKTOP */}
        <aside className="desktop-filters" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Active Filters Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-title)', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} /> Filtros
            </span>
            {(selectedCategory || selectedBrand || selectedDifficulty || priceMin || priceMax || searchTerm) && (
              <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: 'var(--accent-neon)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                Limpiar
              </button>
            )}
          </div>

          {/* Categorías */}
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px' }}>Categorías</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <button 
                onClick={() => handleCategorySelect('')}
                style={{ background: 'none', border: 'none', color: !selectedCategory ? 'var(--accent-neon)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: !selectedCategory ? 700 : 400 }}
              >
                Todos los productos
              </button>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => handleCategorySelect(cat)}
                  style={{ background: 'none', border: 'none', color: selectedCategory === cat ? 'var(--accent-neon)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: selectedCategory === cat ? 700 : 400 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de Experiencia */}
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px' }}>Nivel de Cultivo</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {['principiante', 'intermedio', 'avanzado'].map(level => (
                <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'capitalize', color: selectedDifficulty === level ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  <input 
                    type="radio" 
                    name="difficulty" 
                    checked={selectedDifficulty === level}
                    onChange={() => {
                      setSelectedDifficulty(level);
                      dbService.logEvent(sessionToken, 'filter_difficulty', { level });
                    }}
                    style={{ accentColor: 'var(--accent-neon)' }}
                  />
                  {level}
                </label>
              ))}
              {selectedDifficulty && (
                <button onClick={() => setSelectedDifficulty('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', marginTop: '4px' }}>
                  Quitar filtro de nivel
                </button>
              )}
            </div>
          </div>

          {/* Marca */}
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px' }}>Marca</h4>
            <select 
              value={selectedBrand} 
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                dbService.logEvent(sessionToken, 'filter_brand', { brand: e.target.value });
              }}
              className="input" 
              style={{ padding: '8px', fontSize: '0.85rem' }}
            >
              <option value="">Todas las marcas</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Rango de Precios */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px' }}>Rango de Precios</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="input" 
                style={{ padding: '8px', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="input" 
                style={{ padding: '8px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

        </aside>

        {/* PRODUCTS GRID AREA */}
        <div>
          
          {/* Header toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Mostrando <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
            </div>
            
            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ordenar por:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="input" 
                style={{ padding: '8px 16px', fontSize: '0.85rem', width: '180px' }}
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
                <option value="name">Alfabético</option>
              </select>
              
              <button 
                onClick={() => setMobileFiltersOpen(true)} 
                className="mobile-filters-btn btn btn-outline" 
                style={{ display: 'none', padding: '8px 12px' }}
              >
                <SlidersHorizontal size={16} /> Filtros
              </button>
            </div>
          </div>

          {/* Empty search fallback */}
          {filteredProducts.length === 0 && (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <Search size={48} style={{ color: 'var(--action-yellow)' }} />
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No encontramos resultados exactos</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto' }}>
                  No hay productos con esos filtros o término de búsqueda. ¿Querés consultarnos directamente o limpiar los filtros para ver todo?
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={clearAllFilters} className="btn btn-outline">Ver Todo el Catálogo</button>
                <a 
                  href={`https://wa.me/5491123456789?text=Hola%20Imperio%20Verde%2C%20estaba%20buscando%20"${searchTerm || 'productos'}"%20y%20no%20lo%20encontré%20en%20la%20web.%20¿Me%20ayudan?`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                  style={{ backgroundColor: '#25D366', color: '#fff' }}
                  onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'shop_empty_search' })}
                >
                  Consultar WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Grilla */}
          <div className="grid grid-cols-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-card-img-container">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="product-card-img" 
                    onClick={() => navigate(`/productos/${product.category.toLowerCase()}/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                <div className="product-card-body">
                  <div className="product-card-brand">{product.brand}</div>
                  <h3 
                    className="product-card-title nav-link"
                    onClick={() => navigate(`/productos/${product.category.toLowerCase()}/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <div className="product-card-price-row">
                    {product.promotional_price ? (
                      <>
                        <span className="product-card-promo-price">
                          ${product.promotional_price.toLocaleString()}
                        </span>
                        <span className="product-card-old-price">
                          ${product.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="product-card-price">
                        ${product.price.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>COD: {product.id.slice(0, 5)}</span>
                  </div>
                </div>

                <div className="product-card-footer">
                  <Link to={`/productos/${product.category.toLowerCase()}/${product.id}`} className="btn btn-outline product-card-action" title="Ver Producto">
                    Ver Producto
                  </Link>
                  {product.stock > 0 ? (
                    <button onClick={() => handleProductAdd(product)} className="btn btn-primary product-card-action">
                      + Agregar
                    </button>
                  ) : (
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '8px', borderRadius: '4px', textAlign: 'center', flex: 3, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sin Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* MOBILE FILTERS SIDEBAR (MODAL-LIKE) */}
      {mobileFiltersOpen && (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', width: '80%', maxWidth: '320px', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-title)' }}>Filtros</span>
              <button onClick={() => setMobileFiltersOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}><X size={20} /></button>
            </div>

            {/* Categorías mobile */}
            <div>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Categorías</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <button onClick={() => { handleCategorySelect(''); setMobileFiltersOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', color: !selectedCategory ? 'var(--accent-neon)' : 'var(--text-secondary)' }}>Ver Todo</button>
                {categories.map(c => (
                  <button key={c} onClick={() => { handleCategorySelect(c); setMobileFiltersOpen(false); }} style={{ background: 'none', border: 'none', textAlign: 'left', color: selectedCategory === c ? 'var(--accent-neon)' : 'var(--text-secondary)' }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Nivel mobile */}
            <div>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Nivel</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                {['principiante', 'intermedio', 'avanzado'].map(level => (
                  <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'capitalize' }}>
                    <input 
                      type="radio" 
                      name="diff-m"
                      checked={selectedDifficulty === level}
                      onChange={() => setSelectedDifficulty(level)}
                      style={{ accentColor: 'var(--accent-neon)' }}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Marca mobile */}
            <div>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Marca</h4>
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="input">
                <option value="">Todas</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <button onClick={() => setMobileFiltersOpen(false)} className="btn btn-primary" style={{ marginTop: 'auto' }}>Aplicar Filtros</button>
          </div>
        </div>
      )}

      {styleShopMobile}
    </div>
  );
};

const styleShopMobile = (
  <style>{`
    @media (max-width: 900px) {
      .shop-layout {
        grid-template-columns: 1fr !important;
      }
      .desktop-filters {
        display: none !important;
      }
      .mobile-filters-btn {
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
      }
    }
  `}</style>
);
