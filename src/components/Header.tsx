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
      <div className="promo-bar" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 0', fontSize: '0.8rem', textAlign: 'center', fontFamily: 'var(--font-title)' }}>
        <div className="container promo-bar-content" style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <span className="promo-bar-item">🚛 Envíos Gratis en compras mayores a $60.000</span>
          <span className="promo-bar-item">🏠 Retiro Inmediato en Grow Sucursal</span>
          <span className="promo-bar-item">💳 3 Cuotas Sin Interés en todos los productos</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 90, padding: '16px 0' }}>
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
                className="input header-search-input"
                style={{ paddingRight: '45px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="header-search-button" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
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
            <Link to="/carrito" className="header-cart-link" onClick={() => dbService.logEvent(sessionToken, 'nav_click', { to: '/carrito' })} style={{ position: 'relative', padding: '8px' }}>
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mobile-nav" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-title)', fontWeight: 600, position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 99 }}>
            
            {/* Mobile Search */}
            <form onSubmit={triggerSearchSubmit} style={{ display: 'flex', position: 'relative', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="¿Qué necesitás para tu cultivo?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input header-search-input"
                style={{ paddingRight: '45px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="header-search-button" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none' }}>
                <Search size={18} />
              </button>
            </form>

            <NavLink to="/productos" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/productos', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Flame size={18} /> Tienda Completa</NavLink>
            <NavLink to="/kits" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/kits', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Gift size={18} /> Kits de Cultivo</NavLink>
            <NavLink to="/hidroponia" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/hidroponia', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><Droplet size={18} /> Centro Hidropónico</NavLink>
            <NavLink to="/resolver" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/resolver', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><HelpCircle size={18} /> Resolver Problemas</NavLink>
            <NavLink to="/guias" onClick={() => { setMenuOpen(false); dbService.logEvent(sessionToken, 'nav_click', { to: '/guias', device: 'mobile' }); }} className={({ isActive }) => `mobile-menu-link header-nav-link${isActive ? ' is-active' : ''}`}><BookOpen size={18} /> Guías y Consejos</NavLink>
            
            <div style={{ borderTop: '1px solid rgba(236,212,68,0.18)', paddingTop: '16px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>¿Necesitás ayuda con tu compra?</span>
              <a 
                href="https://wa.me/5491153841079?text=Hola%20Imperio%20Verde%2C%20estoy%20navegando%20la%20tienda%20mobile%20y%20tengo%20una%20consulta."
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
        .site-header {
          background:
            radial-gradient(circle at 28% 0%, rgba(142,36,170,0.16), transparent 34%),
            linear-gradient(90deg, rgba(5,18,11,0.98), rgba(10,30,19,0.98) 52%, rgba(8,19,13,0.98));
          border-bottom: 1px solid rgba(236,212,68,0.38);
          box-shadow: 0 10px 32px rgba(0,0,0,0.3), 0 1px 0 rgba(142,36,170,0.18) inset;
          backdrop-filter: blur(14px);
        }
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
          color: #ecd444;
          position: relative;
          transition: color 180ms ease, transform 180ms ease;
        }
        .header-nav-link:hover,
        .header-nav-link.is-active {
          color: #d45aee;
          transform: translateY(-1px);
          text-shadow: 0 0 18px rgba(212,90,238,0.24);
        }
        .header-search-input {
          background-color: rgba(2,10,6,0.62);
          border-color: rgba(236,212,68,0.34);
          color: #f4f8f5;
        }
        .header-search-input::placeholder {
          color: rgba(221,232,224,0.58);
        }
        .header-search-input:focus {
          border-color: #d45aee;
          box-shadow: 0 0 0 3px rgba(142,36,170,0.15);
        }
        .header-search-button,
        .header-cart-link,
        .mobile-toggle {
          color: #ecd444;
          transition: color 180ms ease, transform 180ms ease;
        }
        .header-search-button:hover,
        .header-cart-link:hover,
        .mobile-toggle:hover {
          color: #d45aee;
          transform: translateY(-1px);
        }
        .mobile-nav {
          background:
            radial-gradient(circle at 90% 0%, rgba(142,36,170,0.2), transparent 45%),
            linear-gradient(145deg, #06150d, #0b2115);
          border-top: 1px solid rgba(236,212,68,0.25);
          border-bottom: 1px solid rgba(236,212,68,0.2);
          box-shadow: 0 16px 30px rgba(0,0,0,0.48);
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
        @media (max-width: 600px) {
          .promo-bar {
            padding: 7px 0 !important;
          }
          .promo-bar-content {
            gap: 0 !important;
          }
          .promo-bar-item:not(:first-child) {
            display: none;
          }
        }
      `}</style>
    </>
  );
};
