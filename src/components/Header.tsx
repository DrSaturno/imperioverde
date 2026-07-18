import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { dbService, Product } from '../services/db';
import { ShoppingCart, Menu, X, Search, HelpCircle, Droplet, Flame, Gift, BookOpen, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { cart, sessionToken } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch products for search bar matching
  useEffect(() => {
    dbService.getProducts().then(setProductsList);
  }, []);

  // Handle Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = productsList.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 5); // Limit 5 suggestions
    setSearchResults(filtered);
  }, [searchQuery, productsList]);

  const triggerSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    dbService.logEvent(sessionToken, 'search', { query: searchQuery });
    navigate(`/productos?buscar=${encodeURIComponent(searchQuery)}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleResultClick = (product: Product) => {
    dbService.logEvent(sessionToken, 'search_suggestion_click', { product_id: product.id, query: searchQuery });
    navigate(`/productos/${product.category.toLowerCase()}/${product.id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Promo Bar */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 0', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'var(--font-title)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <span>🚛 Envíos Gratis en compras mayores a $60.000</span>
          <span>🏠 Retiro Inmediato en Grow Sucursal</span>
          <span>💳 3 Cuotas Sin Interés en todos los productos</span>
        </div>
      </div>

      {/* Main Header */}
      <header style={{ backgroundColor: 'rgba(10, 27, 18, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 90, borderBottom: '1px solid var(--border-glass)', padding: '16px 0' }}>
        <div className="container header-main-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          {/* Logo */}
          <Link to="/" className="header-logo-link" onClick={() => dbService.logEvent(sessionToken, 'logo_click', {})}>
            <img src="/logo-header.png" alt="Imperio Verde Growshop" className="header-logo-image" />
          </Link>

          {/* Buscador */}
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }} className="desktop-search">
            <form onSubmit={triggerSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="¿Qué necesitás para tu cultivo?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="input" 
                style={{ paddingRight: '45px', fontSize: '0.9rem' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-neon)', cursor: 'pointer' }}>
                <Search size={18} />
              </button>
            </form>

            {/* Sugerencias de Busqueda */}
            {showResults && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 100 }}>
                {searchResults.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleResultClick(p)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition-smooth)' }}
                    className="search-item-hover"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.brand} • {p.category}</div>
                    </div>
                    <div style={{ color: 'var(--accent-neon)', fontWeight: 600, fontSize: '0.85rem' }}>
                      ${(p.promotional_price || p.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery.trim() !== '' && searchResults.length === 0 && (
              <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', padding: '16px', zIndex: 100, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={18} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--action-yellow)' }} />
                No encontramos productos exactos. Intentá buscar por categoría o consultanos directamente.
              </div>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px', fontFamily: 'var(--font-title)', fontSize: '0.95rem', fontWeight: 600 }}>
            <NavLink to="/productos" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/productos' })} className={({ isActive }) => `header-nav-link${isActive ? ' is-active' : ''}`}>Tienda</NavLink>
            <NavLink to="/kits" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/kits' })} className={({ isActive }) => `header-nav-link${isActive ? ' is-active' : ''}`}>Kits</NavLink>
            <NavLink to="/hidroponia" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/hidroponia' })} className={({ isActive }) => `header-nav-link${isActive ? ' is-active' : ''}`}>Hidroponía</NavLink>
            <NavLink to="/resolver" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/resolver' })} className={({ isActive }) => `header-nav-link${isActive ? ' is-active' : ''}`}>Resolver Problemas</NavLink>
            <NavLink to="/guias" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/guias' })} className={({ isActive }) => `header-nav-link${isActive ? ' is-active' : ''}`}>Guías</NavLink>
          </nav>

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/carrito" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/carrito' })} style={{ position: 'relative', padding: '8px', color: 'var(--text-primary)' }}>
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--accent-neon)', color: '#030a06', fontSize: '0.75rem', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="mobile-toggle"
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mobile-nav" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-title)', fontWeight: 600, position: 'absolute', top: '100%', left: 0, right: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 99 }}>
            
            {/* Mobile Search */}
            <form onSubmit={triggerSearchSubmit} style={{ display: 'flex', position: 'relative', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="¿Qué necesitás para tu cultivo?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input" 
                style={{ paddingRight: '45px', fontSize: '0.9rem' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-neon)' }}>
                <Search size={18} />
              </button>
            </form>

            <NavLink to="/productos" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/productos', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Flame size={18} /> Tienda Completa</NavLink>
            <NavLink to="/kits" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/kits', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Gift size={18} /> Kits de Cultivo</NavLink>
            <NavLink to="/hidroponia" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/hidroponia', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Droplet size={18} /> Centro Hidropónico</NavLink>
            <NavLink to="/resolver" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/resolver', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><HelpCircle size={18} /> Resolver Problemas</NavLink>
            <NavLink to="/guias" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/guias', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><BookOpen size={18} /> Guías y Consejos</NavLink>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>¿Necesitás ayuda con tu compra?</span>
              <a 
                href="https://wa.me/5491123456789?text=Hola%20Imperio%20Verde%2C%20estoy%20navegando%20la%20tienda%20mobile%20y%20tengo%20una%20consulta." 
                target="_blank" 
                rel="noreferrer"
                style={{ backgroundColor: '#25D366', color: '#fff', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => dbService.logEvent(sessionToken, 'whatsapp_click', { location: 'mobile_nav' })}
              >
                Escribir al WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Styles details to support hiding desktop/mobile parts */}
      <style>{`
        .header-logo-link {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
        }
        .header-logo-image {
          display: block;
          width: 168px;
          height: auto;
          object-fit: contain;
        }
        .header-nav-link {
          color: var(--action-yellow);
        }
        .header-nav-link:hover,
        .header-nav-link.is-active {
          color: var(--accent-violet);
        }
        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .search-item-hover:hover {
          background-color: rgba(0, 230, 118, 0.05) !important;
        }
        .mobile-toggle {
          display: none;
        }
        @media (max-width: 900px) {
          .desktop-nav, .desktop-search {
            display: none !important;
          }
          .mobile-toggle {
            display: block;
          }
          .header-logo-image {
            width: 148px;
          }
        }
      `}</style>
    </>
  );
};
